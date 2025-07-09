import pyodbc
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    server = os.getenv("AZURE_SQL_SERVER")
    database = os.getenv("AZURE_SQL_DATABASE")
    username = os.getenv("AZURE_SQL_USERNAME")
    password = os.getenv("AZURE_SQL_PASSWORD")
    driver = "{ODBC Driver 17 for SQL Server}"

    connection_string = (
        f"DRIVER={driver};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
    )
    try:
        return pyodbc.connect(connection_string)
    except Exception as e:
        print("Error al conectar a la base de datos:", e)
        return None
