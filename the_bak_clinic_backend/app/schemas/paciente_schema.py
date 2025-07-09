from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date

class PacienteBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50, description="Nombre del paciente")
    apellido: str = Field(..., min_length=1, max_length=50, description="Apellido del paciente")
    rut: str = Field(..., pattern=r"^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$", description="RUT del paciente (formato: XX.XXX.XXX-X)")
    fecha_nacimiento: date = Field(..., description="Fecha de nacimiento del paciente")
    telefono: Optional[str] = Field(None, max_length=15, description="Teléfono de contacto del paciente")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico del paciente")
    direccion: Optional[str] = Field(None, max_length=200, description="Dirección del paciente")
    prevision: Optional[str] = Field(None, max_length=50, description="Previsión de salud del paciente (ej. Fonasa, Isapre)")
    numero_ficha: Optional[str] = Field(None, max_length=50, description="Número de ficha o historial clínico")

    class Config:
        orm_mode = True
        anystr_strip_whitespace = True
        # Para permitir que 'date' se valide correctamente desde un string ISO 8601
        # Pydantic v1 lo hace por defecto, en v2 puede necesitarse json_encoders o similar si se serializa/deserializa mucho
        # Por ahora, FastAPI y Pydantic deberían manejar bien la conversión de 'date' strings.

class PacienteCreate(PacienteBase):
    # Campos adicionales específicos para la creación, si los hubiera
    pass

class PacienteUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=50)
    apellido: Optional[str] = Field(None, min_length=1, max_length=50)
    rut: Optional[str] = Field(None, pattern=r"^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$")
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = Field(None, max_length=200)
    prevision: Optional[str] = Field(None, max_length=50)
    numero_ficha: Optional[str] = Field(None, max_length=50)
    # Considerar si se pueden actualizar campos como 'activo' si existiera

class PacienteInDBBase(PacienteBase):
    id_paciente: int = Field(..., description="ID único del paciente") # Asumiendo que es un entero en la BD
    fecha_registro: datetime = Field(default_factory=datetime.utcnow, description="Fecha de registro del paciente en el sistema")
    # Podría haber un campo 'activo' también

class PacientePublic(PacienteInDBBase):
    # Aquí se podrían calcular campos derivados si fuera necesario, ej. edad
    # edad: Optional[int] = None
    pass

class PacienteList(BaseModel):
    pacientes: list[PacientePublic]
    total: int
