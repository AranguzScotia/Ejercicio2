from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.database import get_connection
import pyodbc
from app.schemas.reporte_schema import ReporteGeneralDataPublic, ConteoPorEstado

router = APIRouter()

@router.get("/general", response_model=ReporteGeneralDataPublic)
def get_reporte_general(db: pyodbc.Connection = Depends(get_connection)):
    """
    Proporciona un resumen general de datos y KPIs del sistema.
    """
    total_pacientes = 0
    total_usuarios = 0
    cirugias_por_estado: List[ConteoPorEstado] = []

    with db.cursor() as cursor:
        try:
            # Conteo total de pacientes
            cursor.execute("SELECT COUNT(*) FROM Pacientes")
            row = cursor.fetchone()
            if row:
                total_pacientes = row[0]

            # Conteo total de usuarios (personal)
            cursor.execute("SELECT COUNT(*) FROM Usuarios")
            row = cursor.fetchone()
            if row:
                total_usuarios = row[0]

            # Conteo de cirugías por estado
            cursor.execute("""
                SELECT estado_cirugia, COUNT(*) as cantidad
                FROM Cirugias
                GROUP BY estado_cirugia
                ORDER BY estado_cirugia
            """)
            rows = cursor.fetchall()
            if rows:
                for row_estado in rows:
                    cirugias_por_estado.append(ConteoPorEstado(estado=row_estado[0], cantidad=row_estado[1]))

            return ReporteGeneralDataPublic(
                total_pacientes_registrados=total_pacientes,
                total_usuarios_personal=total_usuarios,
                conteo_cirugias_por_estado=cirugias_por_estado
            )

        except Exception as e:
            # En un caso real, se podría querer loguear el error 'e'
            raise HTTPException(status_code=500, detail=f"Error de base de datos al generar el reporte general: {str(e)[:200]}")

# Se podrían añadir más endpoints de reportes específicos aquí
# Ejemplo:
# @router.get("/ocupacion-quirofanos")
# def get_reporte_ocupacion(...): ...
#
# @router.get("/rendimiento-medicos")
# def get_reporte_medicos(...): ...
