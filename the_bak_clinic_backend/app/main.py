from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import usuarios, cirugias, pacientes, limpieza
from app.database import get_connection

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas principales
app.include_router(usuarios.router, prefix="/usuarios")
app.include_router(cirugias.router, prefix="/cirugias")
app.include_router(pacientes.router, prefix="/pacientes")
app.include_router(limpieza.router, prefix="/limpieza")


@app.get("/")
def root():
    return {"message": "API Clínica BAK activa"}


@app.get("/test-db")
def test_db():
    conn = get_connection()
    if not conn:
        return {"error": "No se pudo conectar a la base de datos"}

    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sys.databases")
    dbs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return {"bases_de_datos": dbs}