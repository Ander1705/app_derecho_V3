from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base
import enum

class UserRole(str, enum.Enum):
    COORDINADOR = "coordinador"
    ESTUDIANTE = "estudiante"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.ESTUDIANTE, nullable=False)
    
    # Información específica para estudiantes (solo para programa Derecho)
    codigo_estudiante = Column(String(20), unique=True, nullable=True)  # Código único generado automáticamente
    programa_academico = Column(String(200), default="Derecho", nullable=True)
    semestre = Column(Integer, nullable=True)
    documento_numero = Column(String(20), nullable=True, index=True)
    
    # Información de contacto
    telefono = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    
    # Estado y fechas
    activo = Column(Boolean, default=True, nullable=False)
    email_verificado = Column(Boolean, default=False, nullable=False)
    ultimo_acceso = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    controles_operativos = relationship("ControlOperativo", back_populates="user")

    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellidos}"

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"