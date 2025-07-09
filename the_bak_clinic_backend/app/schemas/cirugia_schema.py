from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Considerar importar PacientePublic y UserPublic si se anidan en respuestas futuras.
# from .paciente_schema import PacientePublic
# from .user_schema import UserPublic

class CirugiaBase(BaseModel):
    id_paciente: int = Field(..., description="ID del paciente asociado a la cirugía")
    id_medico_principal: int = Field(..., description="ID del médico principal a cargo (de la tabla Usuarios)")

    id_quirofano: Optional[int] = Field(None, description="ID del quirófano asignado (si existe una tabla Quirofanos)")
    nombre_quirofano: Optional[str] = Field(None, max_length=100, description="Nombre o número del quirófano si no se usa ID")

    fecha_hora_inicio_programada: datetime = Field(..., description="Fecha y hora de inicio programada para la cirugía")
    duracion_estimada_minutos: Optional[int] = Field(None, gt=0, description="Duración estimada de la cirugía en minutos")
    # fecha_hora_fin_programada se podría calcular o ser un campo separado si es necesario registrarla explícitamente
    # Si se calcula: fecha_hora_inicio_programada + duracion_estimada_minutos

    tipo_cirugia: str = Field(..., max_length=255, description="Tipo o nombre del procedimiento quirúrgico")

    estado_cirugia: str = Field("Programada", max_length=50,
                                description="Estado: Programada, Confirmada, En Quirofano, Realizada, Cancelada, Postpuesta")

    notas_preoperatorias: Optional[str] = Field(None, description="Notas o indicaciones preoperatorias")
    notas_postoperatorias: Optional[str] = Field(None, description="Notas o hallazgos postoperatorios")

    class Config:
        orm_mode = True
        anystr_strip_whitespace = True
        # Pydantic v2 usa `model_config` en lugar de `Config` interna. Asumo v1 o compatibilidad.
        # FastAPI maneja bien la conversión de strings ISO a datetime.

class CirugiaCreate(CirugiaBase):
    # Campos adicionales que solo se envían al crear, si los hubiera.
    # Por ejemplo, si el estado inicial siempre es 'Programada' y no se envía.
    # estado_cirugia: Optional[str] = Field("Programada", max_length=50) # Ya está en Base con default
    pass

class CirugiaUpdate(BaseModel):
    # Todos los campos son opcionales para la actualización
    id_paciente: Optional[int] = None
    id_medico_principal: Optional[int] = None
    id_quirofano: Optional[int] = None
    nombre_quirofano: Optional[str] = Field(None, max_length=100)
    fecha_hora_inicio_programada: Optional[datetime] = None
    duracion_estimada_minutos: Optional[int] = Field(None, gt=0)
    tipo_cirugia: Optional[str] = Field(None, max_length=255)
    estado_cirugia: Optional[str] = Field(None, max_length=50)
    notas_preoperatorias: Optional[str] = None
    notas_postoperatorias: Optional[str] = None
    # No se debería poder cambiar id_cirugia ni fechas de registro/modificación directamente

class CirugiaInDBBase(CirugiaBase):
    id_cirugia: int = Field(..., description="ID único de la cirugía, generado por la BD")
    fecha_creacion_registro: datetime # Se asignará en el router al crear
    fecha_ultima_modificacion: Optional[datetime] = None # Se asignará en el router al actualizar

class CirugiaPublic(CirugiaInDBBase):
    # Aquí se podrían añadir los objetos completos de Paciente y Medico si se hace un JOIN en la consulta
    # Para ello, se necesitarían los schemas PacientePublic y UserPublic (para médicos)
    # paciente: Optional[PacientePublic] = None
    # medico_principal: Optional[UserPublic] = None
    # quirofano: Optional[QuirofanoPublic] = None # Si existiera un schema QuirofanoPublic

    # Por ahora, se devuelven los IDs, y el frontend puede hacer llamadas adicionales si necesita los detalles.
    # O, el backend puede enriquecer estos datos.
    pass

class CirugiaListResponse(BaseModel):
    cirugias: List[CirugiaPublic]
    total: int
