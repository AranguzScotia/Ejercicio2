from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.database import get_connection
import pyodbc
from app.schemas.paciente_schema import PacienteCreate, PacienteUpdate, PacientePublic, PacienteList
from datetime import datetime

router = APIRouter()

# --- Funciones Auxiliares ---

def db_row_to_paciente_public(row: pyodbc.Row, columns: List[str]) -> PacientePublic:
    """Convierte una fila de la base de datos a un objeto PacientePublic."""
    paciente_data_raw = dict(zip(columns, row))

    paciente_data_processed = {}
    for col_name, value in paciente_data_raw.items():
        # Aquí podrías mapear nombres de columna si son diferentes en la BD y el schema Pydantic
        mapped_key = col_name
        paciente_data_processed[mapped_key] = value

    # Pydantic debería manejar la conversión de 'date' y 'datetime' si vienen en formato ISO
    # o ya son los tipos correctos desde la BD.
    # Si `fecha_nacimiento` o `fecha_registro` vienen como strings en un formato no estándar,
    # necesitarían parseo aquí. Ejemplo:
    # if 'fecha_nacimiento' in paciente_data_processed and isinstance(paciente_data_processed['fecha_nacimiento'], str):
    #    paciente_data_processed['fecha_nacimiento'] = datetime.strptime(paciente_data_processed['fecha_nacimiento'], '%Y-%m-%d').date()

    try:
        return PacientePublic(**paciente_data_processed)
    except Exception as e:
        print(f"Error al convertir datos a PacientePublic: {e}. Datos brutos: {paciente_data_raw}, Datos procesados: {paciente_data_processed}")
        raise HTTPException(status_code=500, detail=f"Error de validación de datos del paciente: {str(e)[:200]}")

# --- Endpoints CRUD para Pacientes ---

@router.post("/", response_model=PacientePublic, status_code=status.HTTP_201_CREATED)
def create_paciente(paciente_in: PacienteCreate, db: pyodbc.Connection = Depends(get_connection)):
    query_check_rut = "SELECT id_paciente FROM Pacientes WHERE rut = ?"
    # OUTPUT INSERTED.* es específico de SQL Server. Ajustar para otras BDs.
    query_insert = """
        INSERT INTO Pacientes (nombre, apellido, rut, fecha_nacimiento, telefono, email, direccion, prevision, numero_ficha, fecha_registro)
        OUTPUT INSERTED.id_paciente, INSERTED.nombre, INSERTED.apellido, INSERTED.rut, INSERTED.fecha_nacimiento,
               INSERTED.telefono, INSERTED.email, INSERTED.direccion, INSERTED.prevision, INSERTED.numero_ficha, INSERTED.fecha_registro
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE())
    """
    # GETUTCDATE() es para SQL Server. Usar CURRENT_TIMESTAMP o NOW() para otras.

    params = (
        paciente_in.nombre, paciente_in.apellido, paciente_in.rut, paciente_in.fecha_nacimiento,
        paciente_in.telefono, paciente_in.email, paciente_in.direccion,
        paciente_in.prevision, paciente_in.numero_ficha
    )

    with db.cursor() as cursor:
        try:
            cursor.execute(query_check_rut, paciente_in.rut)
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El RUT '{paciente_in.rut}' ya está registrado para otro paciente.")

            cursor.execute(query_insert, params)
            created_paciente_row = cursor.fetchone()
            if not created_paciente_row:
                db.rollback()
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo crear el paciente (la inserción no devolvió datos).")

            db.commit()
            columns = [col[0] for col in cursor.description]
            return db_row_to_paciente_public(created_paciente_row, columns)

        except pyodbc.IntegrityError as e:
            db.rollback()
            # Podría ser un RUT duplicado si la verificación anterior falló o hay otra constraint
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto de datos al crear paciente. Verifique que el RUT sea único. (Error DB: {str(e)[:100]})")
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al crear paciente: {str(e)[:200]}")


@router.get("/", response_model=PacienteList)
def list_pacientes(skip: int = 0, limit: int = 100, db: pyodbc.Connection = Depends(get_connection)):
    query_count = "SELECT COUNT(*) FROM Pacientes"
    query_select = """
        SELECT id_paciente, nombre, apellido, rut, fecha_nacimiento, telefono, email, direccion, prevision, numero_ficha, fecha_registro
        FROM Pacientes
        ORDER BY id_paciente
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """
    # OFFSET...FETCH es para SQL Server 2012+. Ajustar para otras BDs.

    pacientes_public_list = []
    total_count = 0
    with db.cursor() as cursor:
        try:
            cursor.execute(query_count)
            count_row = cursor.fetchone()
            if count_row:
                total_count = count_row[0]

            cursor.execute(query_select, skip, limit)
            rows = cursor.fetchall()
            if rows:
                columns = [col[0] for col in cursor.description]
                for row in rows:
                    pac_pub = db_row_to_paciente_public(row, columns)
                    pacientes_public_list.append(pac_pub)

            return PacienteList(pacientes=pacientes_public_list, total=total_count)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al listar pacientes: {str(e)[:200]}")


@router.get("/{paciente_id}", response_model=PacientePublic)
def get_paciente(paciente_id: int, db: pyodbc.Connection = Depends(get_connection)):
    query = """
        SELECT id_paciente, nombre, apellido, rut, fecha_nacimiento, telefono, email, direccion, prevision, numero_ficha, fecha_registro
        FROM Pacientes WHERE id_paciente = ?
    """
    with db.cursor() as cursor:
        try:
            cursor.execute(query, paciente_id)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Paciente con ID {paciente_id} no encontrado.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_paciente_public(row, columns)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al obtener paciente: {str(e)[:200]}")


@router.put("/{paciente_id}", response_model=PacientePublic)
def update_paciente(paciente_id: int, paciente_in: PacienteUpdate, db: pyodbc.Connection = Depends(get_connection)):
    update_data = paciente_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay datos proporcionados para actualizar.")

    with db.cursor() as cursor:
        cursor.execute("SELECT rut FROM Pacientes WHERE id_paciente = ?", paciente_id)
        current_paciente_details = cursor.fetchone()
        if not current_paciente_details:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Paciente con ID {paciente_id} no encontrado para actualizar.")

        current_rut = current_paciente_details[0]

        if 'rut' in update_data and update_data['rut'] != current_rut:
            cursor.execute("SELECT id_paciente FROM Pacientes WHERE rut = ? AND id_paciente != ?", update_data['rut'], paciente_id)
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El RUT '{update_data['rut']}' ya está en uso por otro paciente.")

        set_clause_parts = []
        params = []
        for key, value in update_data.items():
            set_clause_parts.append(f"[{key}] = ?")
            params.append(value)

        if not set_clause_parts:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay campos válidos para actualizar.")

        params.append(paciente_id)
        set_clause = ", ".join(set_clause_parts)

        query_update = f"UPDATE Pacientes SET {set_clause} WHERE id_paciente = ?"
        query_select_updated = """
            SELECT id_paciente, nombre, apellido, rut, fecha_nacimiento, telefono, email, direccion, prevision, numero_ficha, fecha_registro
            FROM Pacientes WHERE id_paciente = ?
        """

        try:
            cursor.execute(query_update, tuple(params))
            db.commit()

            cursor.execute(query_select_updated, paciente_id)
            updated_db_row = cursor.fetchone()
            if not updated_db_row:
                 db.rollback() # Poco probable si el commit tuvo éxito, pero por seguridad
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error crítico: Paciente no encontrado después de supuesta actualización.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_paciente_public(updated_db_row, columns)

        except pyodbc.IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto de datos al actualizar paciente: {str(e)[:100]}")
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al actualizar paciente: {str(e)[:200]}")


@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paciente(paciente_id: int, db: pyodbc.Connection = Depends(get_connection)):
    query_check = "SELECT id_paciente FROM Pacientes WHERE id_paciente = ?"
    query_delete = "DELETE FROM Pacientes WHERE id_paciente = ?"

    with db.cursor() as cursor:
        try:
            cursor.execute(query_check, paciente_id)
            if not cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Paciente con ID {paciente_id} no encontrado para eliminar.")

            cursor.execute(query_delete, paciente_id)
            if cursor.rowcount == 0:
                db.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se eliminó el paciente (inesperado).")

            db.commit()
            return None
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al eliminar paciente: {str(e)[:200]}")
