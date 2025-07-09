from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Campos base compartidos por todos los schemas de usuario
class UserBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50, description="Nombre del usuario")
    apellido: str = Field(..., min_length=1, max_length=50, description="Apellido del usuario")
    rut: str = Field(..., pattern=r"^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$", description="RUT del usuario (formato: XX.XXX.XXX-X)")
    email: EmailStr = Field(..., description="Correo electrónico del usuario")
    telefono: Optional[str] = Field(None, max_length=15, description="Teléfono del usuario")
    rol: str = Field(..., max_length=50, description="Rol del usuario en el sistema")
    especialidad: Optional[str] = Field(None, max_length=100, description="Especialidad del usuario (si aplica)")

    class Config:
        orm_mode = True # Compatible con SQLAlchemy y otros ORMs
        anystr_strip_whitespace = True # Limpia espacios en blanco de los strings

# Schema para la creación de un usuario (lo que se espera en el request POST)
class UserCreate(UserBase):
    contrasena: str = Field(..., min_length=8, description="Contraseña del usuario (se hasheará antes de guardar)")

# Schema para la actualización de un usuario (lo que se espera en el request PUT)
# Todos los campos son opcionales
class UserUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=50)
    apellido: Optional[str] = Field(None, min_length=1, max_length=50)
    rut: Optional[str] = Field(None, pattern=r"^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$")
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=15)
    rol: Optional[str] = Field(None, max_length=50)
    especialidad: Optional[str] = Field(None, max_length=100)
    activo: Optional[bool] = None
    # No se permite actualizar la contraseña directamente aquí, usualmente es un endpoint separado

# Schema para representar un usuario tal como está en la base de datos (incluyendo ID y campos generados)
class UserInDBBase(UserBase):
    id_usuario: int = Field(..., description="ID único del usuario") # Asumiendo que es un entero en la BD
    activo: bool = Field(True, description="Estado de actividad del usuario")
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación del usuario")
    ultimo_acceso: Optional[datetime] = Field(None, description="Fecha del último acceso del usuario")

# Schema para la respuesta pública (lo que se devuelve al cliente)
# No incluye la contraseña.
class UserPublic(UserInDBBase):
    pass # Hereda todos los campos de UserInDBBase

# Schema para uso interno, podría incluir la contraseña hasheada
class UserInDB(UserInDBBase):
    hashed_contrasena: str = Field(..., description="Contraseña hasheada del usuario")

# Para listas de usuarios
class UserList(BaseModel):
    usuarios: list[UserPublic]
    total: int
