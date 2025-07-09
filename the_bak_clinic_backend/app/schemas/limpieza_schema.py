from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EstadoQuirofanoBase(BaseModel):
    nombre_quirofano: str = Field(..., description="Nombre o identificador del quirófano")
    estado_limpieza: str = Field(..., description="Ej: Disponible, Ocupado, Limpieza Pendiente, En Limpieza, No Disponible")
    # Podríamos tener una FK a la última cirugía realizada para saber cuándo se ocupó.
    # id_ultima_cirugia: Optional[int] = None
    ultima_vez_ocupado_hasta: Optional[datetime] = Field(None, description="Fecha y hora hasta la que estuvo ocupado por última vez")
    ultima_limpieza_realizada_dt: Optional[datetime] = Field(None, description="Fecha y hora de la última limpieza completada")
    notas_limpieza: Optional[str] = Field(None, description="Notas adicionales sobre el estado o la limpieza")

    class Config:
        orm_mode = True

class EstadoQuirofanoCreate(BaseModel): # Usado si creamos registros de estado, o más bien actualizamos.
    # Para este caso, es más probable que los quirófanos existan y solo actualicemos su estado.
    # Si los quirófanos son entidades separadas, este schema podría no ser 'Create'.
    nombre_quirofano: str
    estado_limpieza: str # Estado inicial al "registrar" un quirófano en el panel de limpieza
    # Otros campos opcionales al crear.

class EstadoQuirofanoUpdate(BaseModel):
    estado_limpieza: Optional[str] = None
    ultima_vez_ocupado_hasta: Optional[datetime] = None
    ultima_limpieza_realizada_dt: Optional[datetime] = None
    notas_limpieza: Optional[str] = None

class EstadoQuirofanoPublic(EstadoQuirofanoBase):
    # Asumimos que no hay una tabla 'EstadoQuirofano' separada con ID propio, sino que
    # el 'nombre_quirofano' es la clave o se gestiona sobre una tabla 'Quirofanos'.
    # Si hubiera una tabla 'Quirofanos' con id_quirofano, ese sería el identificador.
    id_quirofano_fk: Optional[int] = Field(None, description="ID del quirófano si existe tabla Quirofanos")
    # Este schema es lo que se devuelve al listar.

class EstadoQuirofanoListResponse(BaseModel):
    quirofanos: List[EstadoQuirofanoPublic]
    total: int

# Adicionalmente, un schema para una Tarea de Limpieza específica
class TareaLimpieza(BaseModel):
    id_tarea_limpieza: int
    nombre_quirofano: str # O id_quirofano
    asignada_a: Optional[int] # ID del usuario de limpieza
    solicitada_dt: datetime
    completada_dt: Optional[datetime] = None
    estado_tarea: str # Ej: Pendiente, En Progreso, Completada, Verificada
    notas_tarea: Optional[str] = None

    class Config:
        orm_mode = True

class TareaLimpiezaCreate(BaseModel):
    nombre_quirofano: str
    asignada_a: Optional[int] = None # Opcional al crear
    notas_tarea: Optional[str] = None
    # estado_tarea y solicitada_dt se pueden poner por defecto en el backend

class TareaLimpiezaUpdate(BaseModel):
    asignada_a: Optional[int] = None
    estado_tarea: Optional[str] = None
    notas_tarea: Optional[str] = None
    completada_dt: Optional[datetime] = None # Para marcar como completada

class TareaLimpiezaListResponse(BaseModel):
    tareas: List[TareaLimpieza]
    total: int
