from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()

@router.get("/")
def get_limpieza():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Limpieza")
    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return results
