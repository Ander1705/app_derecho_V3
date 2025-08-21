from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.config.database import Base
import enum
import uuid
import secrets

class EstadoRegistro(str, enum.Enum):
    PENDIENTE = "Pendiente"
    REGISTRADO = "Registrado"

class EstudianteValido(Base):
    """
    Modelo para pre-registro de estudiantes válidos del sistema
    Solo estudiantes registrados aquí por el coordinador pueden crear cuentas
    """
    __tablename__ = "estudiantes_validos"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_estudiante = Column(String(20), unique=True, nullable=False, index=True)  # Código único generado automáticamente
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email_institucional = Column(String(255), unique=True, nullable=False, index=True)
    documento_numero = Column(String(20), unique=True, nullable=False, index=True)
    
    # Campos fijos para programa de Derecho
    programa_academico = Column(String(200), default="Derecho", nullable=False)
    semestre = Column(Integer, nullable=False)
    
    # Estado del registro
    estado = Column(SQLEnum(EstadoRegistro), default=EstadoRegistro.PENDIENTE, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    
    # Fechas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    @staticmethod
    def generar_codigo_unico():
        """Genera un código único para el estudiante"""
        # Formato: DER + 4 dígitos aleatorios + primeras 4 letras de un UUID
        random_digits = ''.join(secrets.choice('0123456789') for _ in range(4))
        uuid_part = str(uuid.uuid4()).replace('-', '')[:4].upper()
        return f"DER{random_digits}{uuid_part}"
    
    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellidos}"
    
    def __repr__(self):
        return f"<EstudianteValido(codigo='{self.codigo_estudiante}', nombre='{self.nombre} {self.apellidos}', estado='{self.estado}')>"