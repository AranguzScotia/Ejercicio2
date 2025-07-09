from pydantic import BaseModel

class Cirugia(BaseModel):
    id_cirugia: int
    paciente: str
    fecha: str
    hora: str
    duracion: float
    pabellon: str
    medico: str
    estado: str
