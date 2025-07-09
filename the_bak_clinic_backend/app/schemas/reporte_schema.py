from pydantic import BaseModel, Field
from typing import List, Dict

class ConteoPorEstado(BaseModel):
    estado: str
    cantidad: int

class ReporteGeneralDataPublic(BaseModel):
    total_pacientes_registrados: int = Field(..., description="Número total de pacientes en el sistema")
    total_usuarios_personal: int = Field(..., description="Número total de usuarios (personal) en el sistema")
    conteo_cirugias_por_estado: List[ConteoPorEstado] = Field(..., description="Lista de conteos de cirugías agrupadas por su estado actual")
    # Se podrían añadir más KPIs aquí, como:
    # promedio_duracion_cirugias_realizadas_min: Optional[float] = None
    # tasa_ocupacion_quirofanos_hoy_porcentaje: Optional[float] = None

    class Config:
        orm_mode = True
