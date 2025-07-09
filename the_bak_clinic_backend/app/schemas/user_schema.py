from pydantic import BaseModel

class User(BaseModel):
    id_usuario: str
    nombre: str
    correo: str
    rut: str
    rol: str
    especialidad: str
    ultimo_acceso: str
    estado: str
