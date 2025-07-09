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
    conn = None
    try:
        conn = pyodbc.connect(connection_string)
        yield conn # Ceder la conexión para su uso
    except pyodbc.Error as e: # Capturar errores específicos de pyodbc
        print(f"Error de base de datos (pyodbc): {e}")
        # Podríamos relanzar una excepción personalizada o HTTPException aquí si es necesario
        # dependiendo de cómo queramos manejar los errores de conexión globalmente.
        # Por ahora, imprimimos y la excepción original se propagará si no se maneja en el endpoint.
        raise # Relanzar para que FastAPI lo maneje o un middleware de error global
    except Exception as e:
        print(f"Error general al intentar conectar a la base de datos: {e}")
        raise
    finally:
        if conn:
            conn.close() # Asegurar que la conexión se cierre al final
