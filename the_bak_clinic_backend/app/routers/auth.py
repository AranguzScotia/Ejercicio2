from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Dict, Optional # Añadido Optional
# from pydantic import EmailStr # Podríamos usarlo para validar el formato del email si el username fuera un campo de un schema

router = APIRouter()

# Simulación de una base de datos de usuarios o un servicio de autenticación.
# El 'username' que espera OAuth2PasswordRequestForm será el email.
USUARIO_AUTORIZADO_EMAIL = "admin@clinicabak.cl"
CONTRASENA_AUTORIZADA = "admin" # Mantener simple para la demo

# En una aplicación real, esta función consultaría la tabla Usuarios por email.
# Y la contraseña estaría hasheada.
def obtener_usuario_por_email(email: str) -> Optional[Dict[str, any]]:
    """
    Simula la obtención de un usuario de la base de datos por email.
    """
    if email.lower() == USUARIO_AUTORIZADO_EMAIL.lower():
        return {
            "email": USUARIO_AUTORIZADO_EMAIL,
            "hashed_password": CONTRASENA_AUTORIZADA, # Simula contraseña "hasheada"
            "nombre_completo": "Usuario Admin BAK", # Nombre de ejemplo
            "rol": "administrador", # Rol de ejemplo
            "activo": True,
            "id_usuario": 1 # ID de ejemplo
            # Podríamos añadir el RUT aquí si es necesario para el token o la app
            # "rut": "11.111.111-1"
        }
    return None

@router.post("/login", response_model=Dict[str, str]) # El response_model sigue siendo el token
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint de login. Valida credenciales (email y contraseña) y devuelve un token de acceso.
    FastAPI espera que el cliente envíe 'username' (que será nuestro email) y 'password'.
    """
    # Aquí form_data.username es el email enviado por el cliente.
    usuario_db = obtener_usuario_por_email(form_data.username)

    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos", # Mensaje genérico
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Comparación directa de contraseña (NO PARA PRODUCCIÓN)
    if form_data.password != usuario_db['hashed_password']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generación de token (simulado)
    # En una implementación real, el "sub" del token JWT podría ser el email o el id_usuario.
    # access_token_subject = usuario_db["email"] # o usuario_db["id_usuario"]
    # access_token = create_access_token(data={"sub": access_token_subject, "rol": usuario_db["rol"]})

    access_token = f"fake_jwt_token_for_{usuario_db['email']}" # Token simulado

    return {"access_token": access_token, "token_type": "bearer"}

# Opcional: Endpoint /me para obtener datos del usuario autenticado (requiere manejo de token)
# from app.schemas.user_schema import UserPublic # Suponiendo que UserPublic es el schema de respuesta
# async def get_current_active_user(token: str = Depends(oauth2_scheme)): ... (necesitaría oauth2_scheme)
# @router.get("/me", response_model=UserPublic)
# async def read_users_me(current_user: UserPublic = Depends(get_current_active_user)):
#    return current_user
