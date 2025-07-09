from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class NotificacionBase(BaseModel):
    mensaje: str = Field(..., description="Contenido del mensaje de la notificación")
    tipo: str = Field(default="info", description="Tipo de notificación (ej: info, alerta, error, exito)")
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow, description="Fecha y hora de creación de la notificación")
    leida: bool = Field(default=False, description="Indica si la notificación ha sido leída por el usuario")

    # Campos opcionales para enlazar a entidades específicas
    entidad_tipo: Optional[str] = Field(None, description="Tipo de entidad relacionada (ej: Cirugia, Paciente, Quirofano)")
    entidad_id: Optional[Union[int, str]] = Field(None, description="ID de la entidad relacionada")
    # Link para navegar directamente a la entidad, si aplica
    # link_entidad: Optional[str] = Field(None, description="URL relativa para ver la entidad relacionada")

    class Config:
        orm_mode = True

class NotificacionPublic(NotificacionBase):
    id_notificacion: Union[int, str] = Field(..., description="ID único de la notificación (podría ser UUID string o int)")
    # El ID podría generarse en la BD o al crear la notificación en lógica de negocio

class NotificacionCreate(NotificacionBase): # Si se crean notificaciones vía API
    pass

class NotificacionUpdate(BaseModel): # Para marcar como leída, por ejemplo
    leida: Optional[bool] = None

class NotificacionListResponse(BaseModel):
    notificaciones: List[NotificacionPublic]
    total_no_leidas: int = Field(..., description="Número total de notificaciones no leídas para el usuario")
    # total_general: int # Podría ser útil si hay paginación de notificaciones leídas también

    # Se podría incluir paginación aquí si la lista de notificaciones es muy larga
    # skip: int
    # limit: int
    # total_notificaciones_historicas: int
