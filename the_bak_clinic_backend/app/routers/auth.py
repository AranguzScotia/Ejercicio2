from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Dict

# Para una implementación más robusta, se usarían tokens JWT y utilidades de contraseña
# from passlib.context import CryptContext
# from datetime import timedelta
# from app.core.config import settings # para JWT_SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
# from app.services.auth_service import create_access_token # servicio para crear tokens

router = APIRouter()

# Simulación de una base de datos de usuarios o un servicio de autenticación
# En una aplicación real, esto consultaría la base de datos y verificaría contraseñas hasheadas.
USUARIO_AUTORIZADO_RUT = "12.345.678-9" # Usaremos el RUT como username
CONTRASENA_AUTORIZADA = "admin" # Contraseña en texto plano para esta demo

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Para hashear y verificar contraseñas

def verificar_contrasena(contrasena_plana: str, contrasena_hasheada: str) -> bool:
    # return pwd_context.verify(contrasena_plana, contrasena_hasheada)
    # Para la demo, comparamos directamente:
    return contrasena_plana == contrasena_hasheada

def obtener_usuario_por_rut(rut: str) -> Dict | None:
    """
    Simula la obtención de un usuario de la base de datos.
    En una aplicación real, esto haría una consulta a la tabla Usuarios.
    """
    if rut == USUARIO_AUTORIZADO_RUT:
        return {
            "rut": USUARIO_AUTORIZADO_RUT,
            "hashed_password": CONTRASENA_AUTORIZADA, # Simula contraseña "hasheada" (en este caso, plana)
            "nombre_completo": "Usuario Autorizado Demo",
            "rol": "administrador",
            "activo": True
        }
    return None


@router.post("/login", response_model=Dict[str, str])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint de login. Valida credenciales y devuelve un token de acceso.
    FastAPI espera que el cliente envíe 'username' y 'password' en el cuerpo
    de la solicitud (form-data).
    En nuestro caso, el 'username' será el RUT.
    """
    usuario_db = obtener_usuario_por_rut(form_data.username)

    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # En una implementación real, form_data.password sería la contraseña plana
    # y usuario_db['hashed_password'] la contraseña hasheada de la BD.
    # if not verificar_contrasena(form_data.password, usuario_db['hashed_password']):
    # Para esta demo con contraseña plana:
    if form_data.password != usuario_db['hashed_password']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos", # Mismo mensaje para no revelar si es el user o pass
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Aquí se generaría un token JWT real. Por ahora, un token falso.
    # access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # access_token = create_access_token(
    #     data={"sub": usuario_db["rut"], "rol": usuario_db["rol"]}, expires_delta=access_token_expires
    # )

    # Simulación de token
    access_token = f"fake_token_for_{usuario_db['rut']}"

    return {"access_token": access_token, "token_type": "bearer"}

# Podríamos añadir un endpoint /me para obtener info del usuario actual basado en el token,
# pero eso requiere una implementación de dependencia de seguridad para validar el token.
# Por ahora, lo mantenemos simple.
