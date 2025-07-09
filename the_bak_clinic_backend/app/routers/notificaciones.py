from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.database import get_connection
import pyodbc
from app.schemas.notificacion_schema import NotificacionPublic, NotificacionListResponse
from datetime import datetime, timedelta
import uuid # Para generar IDs únicos para notificaciones simuladas

router = APIRouter()

# Datos simulados de "eventos" que podrían generar notificaciones.
# En un sistema real, esto se consultaría de las tablas correspondientes.
def generar_notificaciones_simuladas(db: pyodbc.Connection) -> List[NotificacionPublic]:
    notificaciones: List[NotificacionPublic] = []

    # 1. Cirugías canceladas recientemente (últimas 24 horas)
    try:
        with db.cursor() as cursor:
            query_cirugias_canceladas = """
                SELECT id_cirugia, tipo_cirugia, fecha_hora_inicio_programada, id_paciente
                FROM Cirugias
                WHERE estado_cirugia = 'Cancelada'
                  AND fecha_ultima_modificacion >= ?
                ORDER BY fecha_ultima_modificacion DESC
            """ # Asumimos que fecha_ultima_modificacion se actualiza al cambiar estado
            fecha_limite = datetime.utcnow() - timedelta(days=1)
            cursor.execute(query_cirugias_canceladas, fecha_limite)
            rows = cursor.fetchall()
            for row in rows:
                notificaciones.append(NotificacionPublic(
                    id_notificacion=str(uuid.uuid4()), # ID único simulado
                    mensaje=f"Cirugía '{row[1]}' (ID: {row[0]}) para paciente ID {row[3]} fue cancelada.",
                    tipo="alerta",
                    fecha_creacion=datetime.utcnow(), # Simular que se crea ahora
                    leida=False, # Todas las nuevas como no leídas
                    entidad_tipo="Cirugia",
                    entidad_id=row[0]
                ))
    except Exception as e:
        print(f"Error generando notificaciones de cirugías canceladas: {e}")


    # 2. Quirófanos que requieren limpieza urgente (estado "Limpieza Pendiente")
    try:
        with db.cursor() as cursor:
            query_limpieza_pendiente = """
                SELECT nombre_quirofano, notas_limpieza, ultima_vez_ocupado_hasta
                FROM EstadoLimpiezaQuirofanos
                WHERE estado_limpieza = 'Limpieza Pendiente'
                ORDER BY ultima_vez_ocupado_hasta ASC
            """ # Más antiguo ocupado = más urgente
            cursor.execute(query_limpieza_pendiente)
            rows = cursor.fetchall()
            for row in rows:
                 # Podríamos añadir lógica de "urgencia" si lleva mucho tiempo pendiente
                tiempo_ocupado_str = f" (últ. ocupado: {row[2].strftime('%Y-%m-%d %H:%M') if row[2] else 'N/A'})" if row[2] else ""
                notificaciones.append(NotificacionPublic(
                    id_notificacion=str(uuid.uuid4()),
                    mensaje=f"Quirófano '{row[0]}' requiere limpieza urgente.{tiempo_ocupado_str}",
                    tipo="alerta",
                    fecha_creacion=datetime.utcnow(),
                    leida=False,
                    entidad_tipo="QuirofanoLimpieza", # Tipo inventado
                    entidad_id=row[0] # Nombre del quirófano como ID
                ))
    except Exception as e:
        print(f"Error generando notificaciones de limpieza: {e}")

    # 3. (Simulado) Nuevos pacientes VIP registrados (no hay campo VIP, es solo un ejemplo)
    if len(notificaciones) < 5: # Solo añadir si no hay muchas ya
        notificaciones.append(NotificacionPublic(
            id_notificacion=str(uuid.uuid4()),
            mensaje="Nuevo paciente importante 'Juan VIP Ejemplo' registrado. Revisar ficha.",
            tipo="info",
            fecha_creacion=datetime.utcnow() - timedelta(hours=2), # Un poco más antiguo
            leida=False,
            entidad_tipo="Paciente",
            entidad_id=9999 # ID simulado
        ))

    # Simular algunas notificaciones leídas más antiguas
    notificaciones.append(NotificacionPublic(
        id_notificacion=str(uuid.uuid4()),
        mensaje="Recordatorio: Mantenimiento del equipo de Rayos X programado para mañana.",
        tipo="info",
        fecha_creacion=datetime.utcnow() - timedelta(days=2),
        leida=True, # Marcada como leída
    ))

    # Ordenar por fecha de creación (más recientes primero)
    notificaciones.sort(key=lambda n: n.fecha_creacion, reverse=True)

    return notificaciones


@router.get("/", response_model=NotificacionListResponse)
def get_notificaciones_list(
    limit: Optional[int] = Query(20, ge=1, le=100),
    db: pyodbc.Connection = Depends(get_connection)
):
    """
    Obtiene una lista de notificaciones/alertas para el usuario.
    Actualmente son simuladas y no específicas del usuario.
    """
    # En un sistema real, las notificaciones estarían en una tabla, filtradas por usuario_id,
    # y con un sistema de creación de eventos.

    simulated_notifications = generar_notificaciones_simuladas(db)

    no_leidas = [n for n in simulated_notifications if not n.leida]

    # Devolver solo las 'limit' más recientes, pero el conteo de no leídas es sobre todas.
    return NotificacionListResponse(
        notificaciones=simulated_notifications[:limit],
        total_no_leidas=len(no_leidas)
    )

@router.put("/{notificacion_id}/leida", status_code=status.HTTP_204_NO_CONTENT)
def mark_notification_as_read(notificacion_id: str):
    """
    Marca una notificación como leída. (Simulado)
    En un sistema real, esto actualizaría el estado 'leida' en la base de datos.
    """
    print(f"Simulación: Notificación {notificacion_id} marcada como leída.")
    # Aquí iría la lógica para actualizar la BD:
    # UPDATE Notificaciones SET leida = TRUE WHERE id_notificacion = ? AND usuario_id = ?
    # (Asegurando que el usuario solo pueda marcar sus propias notificaciones)
    if notificacion_id: # Solo para que el linter no se queje de no usarlo
        return None
    # Si la notificación no existe o no pertenece al usuario, se podría devolver 404 o 403.
    # Por ahora, siempre 204.
    return None

# Podría haber un endpoint para marcar todas como leídas.
# @router.put("/marcar-todas-leidas", status_code=status.HTTP_204_NO_CONTENT)
# def mark_all_notifications_as_read(...): ...
