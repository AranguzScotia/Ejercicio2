from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from app.database import get_connection
import pyodbc
from app.schemas.cirugia_schema import CirugiaCreate, CirugiaUpdate, CirugiaPublic, CirugiaListResponse
from datetime import datetime, date

router = APIRouter()

# --- Funciones Auxiliares ---

def db_row_to_cirugia_public(row: pyodbc.Row, columns: List[str]) -> CirugiaPublic:
    """Convierte una fila de la base de datos a un objeto CirugiaPublic."""
    cirugia_data_raw = dict(zip(columns, row))

    cirugia_data_processed = {}
    for col_name, value in cirugia_data_raw.items():
        mapped_key = col_name
        cirugia_data_processed[mapped_key] = value

    # Pydantic maneja la conversión de datetime si son objetos datetime o strings ISO.
    # Asegurarse de que los campos de fecha/hora sean correctos.
    # Ejemplo: si 'fecha_hora_inicio_programada' es solo 'fecha_inicio' y 'hora_inicio' en la BD:
    # if 'fecha_inicio' in cirugia_data_processed and 'hora_inicio' in cirugia_data_processed:
    #     fecha_str = str(cirugia_data_processed.pop('fecha_inicio')) # Asegurar que sea string
    #     hora_str = str(cirugia_data_processed.pop('hora_inicio')) # Asegurar que sea string
    #     cirugia_data_processed['fecha_hora_inicio_programada'] = datetime.fromisoformat(f"{fecha_str}T{hora_str}")


    # Asignar valores por defecto si faltan campos requeridos por CirugiaPublic y no son opcionales
    # Esto es una salvaguarda, idealmente las queries SQL seleccionan todas las columnas necesarias.
    if 'fecha_creacion_registro' not in cirugia_data_processed:
        cirugia_data_processed['fecha_creacion_registro'] = datetime.utcnow() # Default si no viene de BD

    try:
        return CirugiaPublic(**cirugia_data_processed)
    except Exception as e:
        print(f"Error al convertir datos a CirugiaPublic: {e}. Datos brutos: {cirugia_data_raw}, Datos procesados: {cirugia_data_processed}")
        raise HTTPException(status_code=500, detail=f"Error de validación de datos de la cirugía: {str(e)[:200]}")


# --- Endpoints CRUD para Cirugías ---

@router.post("/", response_model=CirugiaPublic, status_code=status.HTTP_201_CREATED)
def create_cirugia(cirugia_in: CirugiaCreate, db: pyodbc.Connection = Depends(get_connection)):
    # Validaciones previas (ej. verificar existencia de paciente, médico, quirófano si se usan IDs)
    # with db.cursor() as cursor_check:
    #     cursor_check.execute("SELECT id_paciente FROM Pacientes WHERE id_paciente = ?", cirugia_in.id_paciente)
    #     if not cursor_check.fetchone():
    #         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Paciente con ID {cirugia_in.id_paciente} no encontrado.")
        # Similar para medico y quirofano...

    query_insert = """
        INSERT INTO Cirugias (
            id_paciente, id_medico_principal, id_quirofano, nombre_quirofano,
            fecha_hora_inicio_programada, duracion_estimada_minutos, fecha_hora_fin_programada,
            tipo_cirugia, estado_cirugia, notas_preoperatorias, notas_postoperatorias,
            fecha_creacion_registro, fecha_ultima_modificacion
        )
        OUTPUT INSERTED.*
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE())
    """
    # GETUTCDATE() es para SQL Server.
    # Calcular fecha_hora_fin_programada si no se provee y hay duración
    fecha_fin_calculada = None
    if cirugia_in.fecha_hora_fin_programada:
        fecha_fin_calculada = cirugia_in.fecha_hora_fin_programada
    elif cirugia_in.duracion_estimada_minutos:
        from datetime import timedelta
        fecha_fin_calculada = cirugia_in.fecha_hora_inicio_programada + timedelta(minutes=cirugia_in.duracion_estimada_minutos)

    params = (
        cirugia_in.id_paciente, cirugia_in.id_medico_principal, cirugia_in.id_quirofano, cirugia_in.nombre_quirofano,
        cirugia_in.fecha_hora_inicio_programada, cirugia_in.duracion_estimada_minutos, fecha_fin_calculada,
        cirugia_in.tipo_cirugia, cirugia_in.estado_cirugia, cirugia_in.notas_preoperatorias, cirugia_in.notas_postoperatorias
    )

    with db.cursor() as cursor:
        try:
            cursor.execute(query_insert, params)
            created_row = cursor.fetchone()
            if not created_row:
                db.rollback()
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo agendar la cirugía (la inserción no devolvió datos).")

            db.commit()
            columns = [col[0] for col in cursor.description]
            # La fila devuelta por OUTPUT INSERTED.* ya tiene fecha_creacion_registro y fecha_ultima_modificacion
            return db_row_to_cirugia_public(created_row, columns)

        except pyodbc.IntegrityError as e: # Foreign key constraints, etc.
            db.rollback()
            detail = f"Conflicto de datos al agendar cirugía. Verifique IDs de paciente, médico, quirófano. (Error DB: {str(e)[:100]})"
            if "FK__Cirugias__id_pac" in str(e): # Ejemplo de detección específica
                 detail = f"El Paciente ID {cirugia_in.id_paciente} no existe."
            elif "FK__Cirugias__id_med" in str(e):
                 detail = f"El Médico ID {cirugia_in.id_medico_principal} no existe."
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al agendar cirugía: {str(e)[:200]}")


@router.get("/", response_model=CirugiaListResponse)
def list_cirugias(
    fecha_desde: Optional[date] = Query(None, description="Filtrar cirugías desde esta fecha (YYYY-MM-DD)"),
    fecha_hasta: Optional[date] = Query(None, description="Filtrar cirugías hasta esta fecha (YYYY-MM-DD)"),
    id_paciente: Optional[int] = Query(None),
    id_medico: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: pyodbc.Connection = Depends(get_connection)
):
    select_query = """
        SELECT id_cirugia, id_paciente, id_medico_principal, id_quirofano, nombre_quirofano,
               fecha_hora_inicio_programada, duracion_estimada_minutos, fecha_hora_fin_programada,
               tipo_cirugia, estado_cirugia, notas_preoperatorias, notas_postoperatorias,
               fecha_creacion_registro, fecha_ultima_modificacion
        FROM Cirugias
    """
    count_query = "SELECT COUNT(*) FROM Cirugias"

    where_clauses = []
    params = []

    if fecha_desde:
        where_clauses.append("CONVERT(date, fecha_hora_inicio_programada) >= ?")
        params.append(fecha_desde)
    if fecha_hasta:
        where_clauses.append("CONVERT(date, fecha_hora_inicio_programada) <= ?")
        params.append(fecha_hasta)
    if id_paciente is not None:
        where_clauses.append("id_paciente = ?")
        params.append(id_paciente)
    if id_medico is not None:
        where_clauses.append("id_medico_principal = ?")
        params.append(id_medico)
    if estado:
        where_clauses.append("estado_cirugia = ?")
        params.append(estado)

    if where_clauses:
        where_sql = " WHERE " + " AND ".join(where_clauses)
        select_query += where_sql
        count_query += where_sql

    select_query += " ORDER BY fecha_hora_inicio_programada OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
    # Convert params to tuple for pyodbc for the main query
    paged_params = tuple(params + [skip, limit])

    cirugias_list = []
    total_count = 0

    with db.cursor() as cursor:
        try:
            cursor.execute(count_query, tuple(params)) # Params for count query (without skip/limit)
            count_row = cursor.fetchone()
            if count_row:
                total_count = count_row[0]

            cursor.execute(select_query, paged_params)
            rows = cursor.fetchall()
            if rows:
                columns = [col[0] for col in cursor.description]
                for row in rows:
                    cir_pub = db_row_to_cirugia_public(row, columns)
                    cirugias_list.append(cir_pub)

            return CirugiaListResponse(cirugias=cirugias_list, total=total_count)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al listar cirugías: {str(e)[:200]}")


@router.get("/{cirugia_id}", response_model=CirugiaPublic)
def get_cirugia(cirugia_id: int, db: pyodbc.Connection = Depends(get_connection)):
    query = """
        SELECT id_cirugia, id_paciente, id_medico_principal, id_quirofano, nombre_quirofano,
               fecha_hora_inicio_programada, duracion_estimada_minutos, fecha_hora_fin_programada,
               tipo_cirugia, estado_cirugia, notas_preoperatorias, notas_postoperatorias,
               fecha_creacion_registro, fecha_ultima_modificacion
        FROM Cirugias WHERE id_cirugia = ?
    """
    with db.cursor() as cursor:
        try:
            cursor.execute(query, cirugia_id)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cirugía con ID {cirugia_id} no encontrada.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_cirugia_public(row, columns)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al obtener cirugía: {str(e)[:200]}")


@router.put("/{cirugia_id}", response_model=CirugiaPublic)
def update_cirugia(cirugia_id: int, cirugia_in: CirugiaUpdate, db: pyodbc.Connection = Depends(get_connection)):
    update_data = cirugia_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay datos proporcionados para actualizar.")

    # Añadir fecha_ultima_modificacion
    update_data["fecha_ultima_modificacion"] = datetime.utcnow()

    with db.cursor() as cursor:
        # Verificar si la cirugía existe
        cursor.execute("SELECT id_cirugia FROM Cirugias WHERE id_cirugia = ?", cirugia_id)
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cirugía con ID {cirugia_id} no encontrada para actualizar.")

        # Validar IDs si se están cambiando (paciente, medico, etc.)
        # if 'id_paciente' in update_data: ... (similar a la validación en create)

        set_clause_parts = [f"[{key}] = ?" for key in update_data.keys()]
        params = list(update_data.values())
        params.append(cirugia_id)
        set_clause = ", ".join(set_clause_parts)

        query_update = f"UPDATE Cirugias SET {set_clause} WHERE id_cirugia = ?"

        try:
            cursor.execute(query_update, tuple(params))
            db.commit()

            # Devolver la cirugía actualizada usando la función get_cirugia
            # Esto asegura que se devuelva el mismo formato y se evite duplicar la lógica de selección.
            # Necesitamos crear un nuevo cursor para esto, ya que get_cirugia espera su propia conexión/cursor.
            # O, mejor, replicar la lógica de get_cirugia aquí con el cursor actual.

            query_select_updated = """
                SELECT id_cirugia, id_paciente, id_medico_principal, id_quirofano, nombre_quirofano,
                       fecha_hora_inicio_programada, duracion_estimada_minutos, fecha_hora_fin_programada,
                       tipo_cirugia, estado_cirugia, notas_preoperatorias, notas_postoperatorias,
                       fecha_creacion_registro, fecha_ultima_modificacion
                FROM Cirugias WHERE id_cirugia = ?
            """
            cursor.execute(query_select_updated, cirugia_id)
            updated_db_row = cursor.fetchone()
            if not updated_db_row:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error crítico: Cirugía no encontrada después de actualización.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_cirugia_public(updated_db_row, columns)

        except pyodbc.IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto de datos al actualizar cirugía: {str(e)[:100]}")
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al actualizar cirugía: {str(e)[:200]}")


@router.delete("/{cirugia_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cirugia(cirugia_id: int, db: pyodbc.Connection = Depends(get_connection)):
    with db.cursor() as cursor:
        try:
            cursor.execute("SELECT id_cirugia FROM Cirugias WHERE id_cirugia = ?", cirugia_id)
            if not cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cirugía con ID {cirugia_id} no encontrada para eliminar.")

            cursor.execute("DELETE FROM Cirugias WHERE id_cirugia = ?", cirugia_id)
            if cursor.rowcount == 0: # Inesperado si la verificación anterior pasó
                db.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se eliminó la cirugía (inesperado).")

            db.commit()
            return None
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al eliminar cirugía: {str(e)[:200]}")
