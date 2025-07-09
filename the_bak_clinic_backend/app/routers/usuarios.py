from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.database import get_connection
import pyodbc
from app.schemas.user_schema import UserCreate, UserUpdate, UserPublic, UserList
from datetime import datetime

router = APIRouter()

# --- Funciones Auxiliares ---

def db_row_to_user_public(row: pyodbc.Row, columns: List[str]) -> UserPublic:
    """Convierte una fila de la base de datos a un objeto UserPublic."""
    user_data_raw = dict(zip(columns, row))

    user_data_processed = {}
    for col_name, value in user_data_raw.items():
        mapped_key = col_name
        user_data_processed[mapped_key] = value

    if 'activo' in user_data_processed and user_data_processed['activo'] is not None:
        user_data_processed['activo'] = bool(user_data_processed['activo'])

    try:
        return UserPublic(**user_data_processed)
    except Exception as e:
        print(f"Error al convertir datos a UserPublic: {e}. Datos brutos: {user_data_raw}, Datos procesados: {user_data_processed}")
        # En un entorno de producción, podrías querer ocultar los detalles de los datos.
        raise HTTPException(status_code=500, detail=f"Error de validación de datos del usuario: {str(e)[:200]}")


# --- Endpoints CRUD para Usuarios ---

@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_usuario(usuario_in: UserCreate, db: pyodbc.Connection = Depends(get_connection)):
    placeholder_hash = "placeholder_for_" + usuario_in.contrasena

    query_check_rut = "SELECT id_usuario FROM Usuarios WHERE rut = ?"
    query_check_email = "SELECT id_usuario FROM Usuarios WHERE email = ?"
    query_insert = """
        INSERT INTO Usuarios (nombre, apellido, rut, email, telefono, rol, especialidad, contrasena_hash, activo, fecha_creacion, ultimo_acceso)
        OUTPUT INSERTED.id_usuario, INSERTED.nombre, INSERTED.apellido, INSERTED.rut, INSERTED.email, INSERTED.telefono, INSERTED.rol, INSERTED.especialidad, INSERTED.activo, INSERTED.fecha_creacion, INSERTED.ultimo_acceso
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETUTCDATE(), NULL)
    """

    params = (
        usuario_in.nombre, usuario_in.apellido, usuario_in.rut, usuario_in.email,
        usuario_in.telefono, usuario_in.rol, usuario_in.especialidad,
        placeholder_hash,
        True
    )

    with db.cursor() as cursor:
        try:
            cursor.execute(query_check_rut, usuario_in.rut)
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El RUT '{usuario_in.rut}' ya está registrado.")

            cursor.execute(query_check_email, usuario_in.email)
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El email '{usuario_in.email}' ya está registrado.")

            cursor.execute(query_insert, params)
            created_user_row = cursor.fetchone()
            if not created_user_row:
                db.rollback()
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo crear el usuario (la inserción no devolvió datos).")

            db.commit()
            columns = [col[0] for col in cursor.description]
            return db_row_to_user_public(created_user_row, columns)

        except pyodbc.IntegrityError as e:
            db.rollback()
            detail_msg = f"Conflicto de datos al crear usuario. Verifique que el RUT y Email sean únicos."
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail_msg + f" (Error DB: {str(e)[:100]})")
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al crear usuario: {str(e)[:200]}")


@router.get("/", response_model=UserList)
def list_usuarios(skip: int = 0, limit: int = 100, db: pyodbc.Connection = Depends(get_connection)):
    query_count = "SELECT COUNT(*) FROM Usuarios"
    query_select = """
        SELECT id_usuario, nombre, apellido, rut, email, telefono, rol, especialidad, activo, fecha_creacion, ultimo_acceso
        FROM Usuarios
        ORDER BY id_usuario
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """

    usuarios_public_list = []
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
                    user_pub = db_row_to_user_public(row, columns)
                    usuarios_public_list.append(user_pub)

            return UserList(usuarios=usuarios_public_list, total=total_count)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al listar usuarios: {str(e)[:200]}")


@router.get("/{usuario_id}", response_model=UserPublic)
def get_usuario(usuario_id: int, db: pyodbc.Connection = Depends(get_connection)):
    query = """
        SELECT id_usuario, nombre, apellido, rut, email, telefono, rol, especialidad, activo, fecha_creacion, ultimo_acceso
        FROM Usuarios WHERE id_usuario = ?
    """
    with db.cursor() as cursor:
        try:
            cursor.execute(query, usuario_id)
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con ID {usuario_id} no encontrado.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_user_public(row, columns)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al obtener usuario: {str(e)[:200]}")


@router.put("/{usuario_id}", response_model=UserPublic)
def update_usuario(usuario_id: int, usuario_in: UserUpdate, db: pyodbc.Connection = Depends(get_connection)):
    update_data = usuario_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay datos proporcionados para actualizar.")

    with db.cursor() as cursor:
        cursor.execute("SELECT rut, email FROM Usuarios WHERE id_usuario = ?", usuario_id)
        current_user_details = cursor.fetchone()
        if not current_user_details:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con ID {usuario_id} no encontrado para actualizar.")

        current_rut, current_email = current_user_details

        if 'rut' in update_data and update_data['rut'] != current_rut:
            cursor.execute("SELECT id_usuario FROM Usuarios WHERE rut = ? AND id_usuario != ?", update_data['rut'], usuario_id)
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El RUT '{update_data['rut']}' ya está en uso por otro usuario.")

        if 'email' in update_data and update_data['email'] != current_email:
            cursor.execute("SELECT id_usuario FROM Usuarios WHERE email = ? AND id_usuario != ?", update_data['email'], usuario_id)
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El email '{update_data['email']}' ya está en uso por otro usuario.")

        set_clause_parts = []
        params = []
        for key, value in update_data.items():
            set_clause_parts.append(f"[{key}] = ?")
            params.append(value)

        if not set_clause_parts:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay campos válidos para actualizar.")

        params.append(usuario_id)
        set_clause = ", ".join(set_clause_parts)

        query_update = f"UPDATE Usuarios SET {set_clause} WHERE id_usuario = ?"
        query_select_updated = """
            SELECT id_usuario, nombre, apellido, rut, email, telefono, rol, especialidad, activo, fecha_creacion, ultimo_acceso
            FROM Usuarios WHERE id_usuario = ?
        """

        try:
            cursor.execute(query_update, tuple(params))
            # No es necesario verificar rowcount == 0 como error si la verificación de existencia ya pasó.
            # Si no hay cambios efectivos, rowcount puede ser 0 en algunas BDs, pero no es un error.
            db.commit()

            cursor.execute(query_select_updated, usuario_id)
            updated_db_row = cursor.fetchone()
            if not updated_db_row:
                 db.rollback()
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error crítico: Usuario no encontrado después de supuesta actualización.")

            columns = [col[0] for col in cursor.description]
            return db_row_to_user_public(updated_db_row, columns)

        except pyodbc.IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto de datos al actualizar usuario: {str(e)[:100]}")
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al actualizar usuario: {str(e)[:200]}")


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: int, db: pyodbc.Connection = Depends(get_connection)):
    query_check = "SELECT id_usuario FROM Usuarios WHERE id_usuario = ?"
    query_delete = "DELETE FROM Usuarios WHERE id_usuario = ?"

    with db.cursor() as cursor:
        try:
            cursor.execute(query_check, usuario_id)
            if not cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con ID {usuario_id} no encontrado para eliminar.")

            cursor.execute(query_delete, usuario_id)
            if cursor.rowcount == 0:
                db.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se eliminó el usuario (inesperado, podría haber sido eliminado por otro proceso).")

            db.commit()
            return None
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error de base de datos al eliminar usuario: {str(e)[:200]}")
