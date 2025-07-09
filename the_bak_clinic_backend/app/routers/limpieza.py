from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.database import get_connection
import pyodbc
from app.schemas.limpieza_schema import (
    EstadoQuirofanoPublic,
    EstadoQuirofanoUpdate,
    EstadoQuirofanoListResponse,
    # EstadoQuirofanoCreate # No lo usaré directamente si los quirófanos se gestionan por nombre
)
from datetime import datetime

router = APIRouter()

# --- Funciones Auxiliares ---

# Lista hardcodeada de quirófanos si no hay una tabla dedicada y queremos asegurar que existan.
# O podemos obtenerlos dinámicamente de la tabla Cirugias.
# Por ahora, asumimos que los registros en EstadoLimpiezaQuirofanos se crean/actualizan.
LISTA_QUIROFANOS_SISTEMA = ["Pabellón 1", "Pabellón 2", "Pabellón 3", "Pabellón Central", "Pabellón Urgencias"]


def db_row_to_estado_quirofano_public(row: pyodbc.Row, columns: List[str]) -> EstadoQuirofanoPublic:
    data_raw = dict(zip(columns, row))
    # Asegurar que los campos datetime sean correctos o None
    for dt_field in ['ultima_vez_ocupado_hasta', 'ultima_limpieza_realizada_dt']:
        if dt_field in data_raw and data_raw[dt_field] is not None and not isinstance(data_raw[dt_field], datetime):
            try:
                data_raw[dt_field] = datetime.fromisoformat(str(data_raw[dt_field]))
            except ValueError:
                data_raw[dt_field] = None # O manejar el error de formato
    try:
        return EstadoQuirofanoPublic(**data_raw)
    except Exception as e:
        print(f"Error convirtiendo fila a EstadoQuirofanoPublic: {e}. Data: {data_raw}")
        raise HTTPException(status_code=500, detail=f"Error validación datos limpieza: {str(e)[:100]}")

# --- Endpoints para Estado de Limpieza de Quirófanos ---

@router.get("/quirofanos/estados", response_model=EstadoQuirofanoListResponse)
def list_estados_quirofanos(db: pyodbc.Connection = Depends(get_connection)):
    """
    Lista el estado de limpieza de todos los quirófanos conocidos.
    Si un quirófano de LISTA_QUIROFANOS_SISTEMA no está en la BD, se podría añadir con estado por defecto.
    """
    query = """
        SELECT nombre_quirofano, estado_limpieza, ultima_vez_ocupado_hasta,
               ultima_limpieza_realizada_dt, notas_limpieza
        FROM EstadoLimpiezaQuirofanos
        ORDER BY nombre_quirofano
    """
    # Asumo que id_quirofano_fk no es una columna directa en esta tabla simulada, sino que nombre_quirofano es la clave.

    estados_quirofanos = []
    db_quirofanos_nombres = set()

    with db.cursor() as cursor:
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            for row in rows:
                eq_public = db_row_to_estado_quirofano_public(row, columns)
                estados_quirofanos.append(eq_public)
                db_quirofanos_nombres.add(eq_public.nombre_quirofano)

            # Opcional: Añadir quirófanos de la lista hardcodeada que no estén en la BD
            for nombre_q_sistema in LISTA_QUIROFANOS_SISTEMA:
                if nombre_q_sistema not in db_quirofanos_nombres:
                    # Crear un estado por defecto para quirófanos no registrados en la tabla
                    default_estado = EstadoQuirofanoPublic(
                        nombre_quirofano=nombre_q_sistema,
                        estado_limpieza="Desconocido", # O "Disponible" por defecto
                        ultima_vez_ocupado_hasta=None,
                        ultima_limpieza_realizada_dt=None,
                        notas_limpieza="Registro no encontrado en BD, estado por defecto."
                    )
                    estados_quirofanos.append(default_estado)

            # Re-ordenar por si se añadieron defaults
            estados_quirofanos.sort(key=lambda q: q.nombre_quirofano)

            return EstadoQuirofanoListResponse(quirofanos=estados_quirofanos, total=len(estados_quirofanos))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al listar estados de quirófanos: {str(e)[:200]}")


@router.get("/quirofanos/{nombre_quirofano}/estado", response_model=EstadoQuirofanoPublic)
def get_estado_quirofano(nombre_quirofano: str, db: pyodbc.Connection = Depends(get_connection)):
    query = """
        SELECT nombre_quirofano, estado_limpieza, ultima_vez_ocupado_hasta,
               ultima_limpieza_realizada_dt, notas_limpieza
        FROM EstadoLimpiezaQuirofanos WHERE nombre_quirofano = ?
    """
    with db.cursor() as cursor:
        try:
            cursor.execute(query, nombre_quirofano)
            row = cursor.fetchone()
            if not row:
                # Si no se encuentra, devolver un estado por defecto o 404
                if nombre_quirofano in LISTA_QUIROFANOS_SISTEMA:
                    return EstadoQuirofanoPublic(
                        nombre_quirofano=nombre_quirofano,
                        estado_limpieza="No Registrado",
                        notas_limpieza="Este quirófano no tiene un registro de estado de limpieza."
                    )
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Estado para quirófano '{nombre_quirofano}' no encontrado.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_estado_quirofano_public(row, columns)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al obtener estado de quirófano: {str(e)[:200]}")


@router.put("/quirofanos/{nombre_quirofano}/estado", response_model=EstadoQuirofanoPublic)
def update_estado_quirofano(nombre_quirofano: str, estado_in: EstadoQuirofanoUpdate, db: pyodbc.Connection = Depends(get_connection)):
    update_data = estado_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay datos proporcionados para actualizar.")

    # Forzar la actualización de ultima_limpieza_realizada_dt si el estado cambia a "Disponible" o "Limpio"
    if estado_in.estado_limpieza and estado_in.estado_limpieza.lower() in ["disponible", "limpio"]:
        update_data["ultima_limpieza_realizada_dt"] = datetime.utcnow()
        # Si se marca como disponible/limpio, quizás limpiar notas_limpieza o ultima_vez_ocupado_hasta?
        # update_data["notas_limpieza"] = update_data.get("notas_limpieza", None) # Mantener si viene, o limpiar
        # update_data["ultima_vez_ocupado_hasta"] = update_data.get("ultima_vez_ocupado_hasta", None)


    set_clause_parts = [f"[{key}] = ?" for key in update_data.keys()] # SQL Server a veces necesita [] para nombres de columna
    params = list(update_data.values())
    params.append(nombre_quirofano)
    set_clause = ", ".join(set_clause_parts)

    # Intenta actualizar. Si no existe, podría crearlo (UPSERT) o fallar.
    # Para UPSERT en SQL Server: MERGE. Para simplificar: UPDATE, y si no afecta filas, INSERT.
    # O, más simple: verificar si existe, luego UPDATE o INSERT.

    query_update = f"UPDATE EstadoLimpiezaQuirofanos SET {set_clause} WHERE nombre_quirofano = ?"
    query_select = """
        SELECT nombre_quirofano, estado_limpieza, ultima_vez_ocupado_hasta,
               ultima_limpieza_realizada_dt, notas_limpieza
        FROM EstadoLimpiezaQuirofanos WHERE nombre_quirofano = ?
    """
    query_insert = f"""
        INSERT INTO EstadoLimpiezaQuirofanos (nombre_quirofano, {", ".join([f'[{k}]' for k in update_data.keys()])})
        VALUES (?, {", ".join(["?"] * len(update_data))})
    """
    insert_params = tuple([nombre_quirofano] + list(update_data.values()))


    with db.cursor() as cursor:
        try:
            cursor.execute(query_update, tuple(params))
            if cursor.rowcount == 0:
                # No se actualizó, intentar insertar (si el quirófano es conocido o se permite creación ad-hoc)
                if nombre_quirofano in LISTA_QUIROFANOS_SISTEMA or True: # True permite crear para cualquier nombre
                    try:
                        # Asegurar que todos los campos de update_data son válidos para la tabla
                        # El query_insert asume que las claves en update_data son nombres de columnas.
                        cursor.execute(query_insert, insert_params)
                        if cursor.rowcount == 0: # Falló la inserción también
                            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo crear el registro de estado del quirófano.")
                    except pyodbc.IntegrityError as ie: # Ej. si nombre_quirofano no existe en una tabla Quirofanos (FK)
                        db.rollback()
                        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto al crear estado para quirófano: {str(ie)[:100]}")
                else:
                    db.rollback()
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quirófano '{nombre_quirofano}' no encontrado y no se permite creación ad-hoc.")

            db.commit()

            cursor.execute(query_select, nombre_quirofano)
            updated_row = cursor.fetchone()
            if not updated_row:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al recuperar estado del quirófano después de la operación.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_estado_quirofano_public(updated_row, columns)

        except pyodbc.Error as e: # pyodbc.Error es más general para errores de BD
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de BD al actualizar estado de quirófano: {str(e)[:200]}")
        except HTTPException:
            raise
        except Exception as e: # Otros errores
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error inesperado al actualizar estado: {str(e)[:200]}")

# Endpoints para TareaLimpieza se podrían añadir aquí si es necesario.
# Ejemplo:
# @router.post("/tareas", response_model=TareaLimpieza, status_code=status.HTTP_201_CREATED)
# def create_tarea_limpieza(tarea_in: TareaLimpiezaCreate, ...): ...
# @router.get("/tareas", response_model=TareaLimpiezaListResponse): ...
# etc.
