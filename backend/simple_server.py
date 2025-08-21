#!/usr/bin/env python3
"""
Simple test server to isolate login functionality
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uvicorn
import os

# Import only what we need
from app.config.database import get_db
from app.models.user import User, UserRole
from app.models.estudiante_valido import EstudianteValido, EstadoRegistro
from app.models.password_reset import PasswordResetToken
from app.config.auth import SecurityConfig
from app.services.email_service import email_service
from datetime import datetime
from typing import List
import random
import string

app = FastAPI(title="Simple Auth Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    apellidos: str
    email: str
    role: str
    activo: bool
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

class EstudianteValidoResponse(BaseModel):
    id: int
    codigo_estudiante: str
    nombre: str
    apellidos: str
    email_institucional: str
    documento_numero: str
    programa_academico: str
    semestre: int
    estado: str
    activo: bool
    created_at: str
    updated_at: str
    
class EstudianteValidoCreate(BaseModel):
    nombre: str
    apellidos: str
    email_institucional: str
    documento_numero: str
    semestre: int

class ValidarCodigoRequest(BaseModel):
    codigo_estudiante: str

class ValidarCodigoResponse(BaseModel):
    id: int
    codigo_estudiante: str
    nombre: str
    apellidos: str
    email_institucional: str
    programa_academico: str
    semestre: int

class RegistroEstudianteRequest(BaseModel):
    codigo_estudiante: str
    password: str
    telefono: str = None

class ValidarDatosPersonalesRequest(BaseModel):
    nombre: str
    apellidos: str
    documento_numero: str

class ValidarDatosPersonalesResponse(BaseModel):
    id: int
    codigo_estudiante: str
    nombre: str
    apellidos: str
    email_institucional: str
    documento_numero: str
    programa_academico: str
    semestre: int

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str

@app.post("/api/auth/login", response_model=TokenResponse)
async def simple_login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Simple login endpoint for testing"""
    try:
        print(f"Login attempt: {user_credentials.email}")
        
        # Sanitize email
        email = SecurityConfig.sanitize_input(user_credentials.email.lower(), 255)
        print(f"Sanitized email: {email}")
        
        # Find user
        user = db.query(User).filter(
            User.email == email,
            User.activo == True
        ).first()
        
        if not user:
            print("User not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"Found user: {user.email}")
        
        # Verify password
        if not SecurityConfig.verify_password(user_credentials.password, user.password_hash):
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print("Password verified")
        
        # Update last access
        user.ultimo_acceso = datetime.utcnow()
        db.commit()
        print("Updated last access")
        
        # Generate token
        access_token = SecurityConfig.create_access_token(
            data={"sub": str(user.id)}, 
            token_type="access"
        )
        print("Generated token")
        
        return {
            "access_token": access_token,
            "refresh_token": access_token,  # Para compatibilidad
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "nombre": user.nombre,
                "apellidos": user.apellidos,
                "email": user.email,
                "role": user.role.value,  # "coordinador"
                "activo": user.activo,
                "created_at": user.created_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Simple auth test server"}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Helper function to get current user
def get_current_user(db: Session = Depends(get_db)):
    """Simple function to get current user - for testing we'll assume coordinator"""
    user = db.query(User).filter(User.role == "coordinador").first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/auth/validar-codigo", response_model=ValidarCodigoResponse)
async def validar_codigo_estudiante(
    request: ValidarCodigoRequest,
    db: Session = Depends(get_db)
):
    """Validar código de estudiante para registro"""
    try:
        estudiante = db.query(EstudianteValido).filter(
            EstudianteValido.codigo_estudiante == request.codigo_estudiante.upper(),
            EstudianteValido.activo == True
        ).first()
        
        if not estudiante:
            raise HTTPException(
                status_code=404, 
                detail=f"No se encontró un estudiante con el código {request.codigo_estudiante}"
            )
        
        return {
            "id": estudiante.id,
            "codigo_estudiante": estudiante.codigo_estudiante,
            "nombre": estudiante.nombre,
            "apellidos": estudiante.apellidos,
            "email_institucional": estudiante.email_institucional,
            "programa_academico": estudiante.programa_academico,
            "semestre": estudiante.semestre
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating student code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/validar-datos-personales", response_model=ValidarDatosPersonalesResponse)
async def validar_datos_personales(
    request: ValidarDatosPersonalesRequest,
    db: Session = Depends(get_db)
):
    """Validar datos personales del estudiante para auto-completar información"""
    try:
        print(f"Validando datos: {request.nombre} {request.apellidos} - {request.documento_numero}")
        
        estudiante = db.query(EstudianteValido).filter(
            EstudianteValido.nombre.ilike(f"%{request.nombre.strip()}%"),
            EstudianteValido.apellidos.ilike(f"%{request.apellidos.strip()}%"),
            EstudianteValido.documento_numero == request.documento_numero.strip(),
            EstudianteValido.activo == True
        ).first()
        
        if not estudiante:
            print(f"No se encontró estudiante con datos: {request.nombre} {request.apellidos} - {request.documento_numero}")
            raise HTTPException(
                status_code=404, 
                detail=f"No se encontró un estudiante pre-registrado con estos datos. Verifica que el coordinador te haya registrado previamente."
            )
        
        print(f"Estudiante encontrado: {estudiante.codigo_estudiante}")
        return {
            "id": estudiante.id,
            "codigo_estudiante": estudiante.codigo_estudiante,
            "nombre": estudiante.nombre,
            "apellidos": estudiante.apellidos,
            "email_institucional": estudiante.email_institucional,
            "documento_numero": estudiante.documento_numero,
            "programa_academico": estudiante.programa_academico,
            "semestre": estudiante.semestre
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error validating personal data: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/registro-estudiante", response_model=TokenResponse)
async def registro_estudiante(
    request: RegistroEstudianteRequest,
    db: Session = Depends(get_db)
):
    """Registrar estudiante después de validar código"""
    try:
        print(f"Registrando estudiante con código: {request.codigo_estudiante}")
        
        # Verificar que el estudiante existe y está activo
        estudiante = db.query(EstudianteValido).filter(
            EstudianteValido.codigo_estudiante == request.codigo_estudiante.upper(),
            EstudianteValido.activo == True
        ).first()
        
        if not estudiante:
            print(f"No se encontró estudiante con código: {request.codigo_estudiante}")
            raise HTTPException(
                status_code=400, 
                detail="Código de estudiante no válido o ya utilizado"
            )
        
        print(f"Estudiante encontrado: {estudiante.nombre} {estudiante.apellidos}")
        
        # Verificar que no existe ya un usuario con este email
        existing_user = db.query(User).filter(
            User.email == estudiante.email_institucional
        ).first()
        
        if existing_user:
            print(f"Ya existe usuario con email: {estudiante.email_institucional}")
            raise HTTPException(
                status_code=400, 
                detail="Ya existe una cuenta con este correo electrónico"
            )
        
        # Crear el usuario
        print("Creando hash de contraseña...")
        password_hash = SecurityConfig.get_password_hash(request.password)
        
        print("Creando nuevo usuario...")
        nuevo_usuario = User(
            nombre=estudiante.nombre,
            apellidos=estudiante.apellidos,
            email=estudiante.email_institucional,
            password_hash=password_hash,
            role=UserRole.ESTUDIANTE,
            codigo_estudiante=estudiante.codigo_estudiante,
            programa_academico=estudiante.programa_academico,
            semestre=estudiante.semestre,
            documento_numero=estudiante.documento_numero,
            activo=True,
            telefono=request.telefono
        )
        
        print("Agregando usuario a la base de datos...")
        db.add(nuevo_usuario)
        
        # Actualizar estado del estudiante
        print("Actualizando estado del estudiante...")
        estudiante.estado = EstadoRegistro.REGISTRADO
        
        print("Haciendo commit...")
        db.commit()
        db.refresh(nuevo_usuario)
        
        print(f"Usuario creado exitosamente con ID: {nuevo_usuario.id}")
        
        # Generar token para auto-login
        print("Generando token de acceso...")
        access_token = SecurityConfig.create_access_token(
            data={"sub": str(nuevo_usuario.id)}, 
            token_type="access"
        )
        
        return {
            "access_token": access_token,
            "refresh_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": nuevo_usuario.id,
                "nombre": nuevo_usuario.nombre,
                "apellidos": nuevo_usuario.apellidos,
                "email": nuevo_usuario.email,
                "role": nuevo_usuario.role.value,
                "codigo_estudiante": nuevo_usuario.codigo_estudiante,
                "programa_academico": nuevo_usuario.programa_academico,
                "semestre": nuevo_usuario.semestre,
                "telefono": nuevo_usuario.telefono,
                "activo": nuevo_usuario.activo,
                "created_at": nuevo_usuario.created_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error registering student: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/coordinador/estudiantes", response_model=List[EstudianteValidoResponse])
async def listar_estudiantes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Listar todos los estudiantes pre-registrados"""
    try:
        estudiantes = db.query(EstudianteValido).filter(EstudianteValido.activo == True).all()
        
        estudiantes_response = []
        for est in estudiantes:
            estudiantes_response.append({
                "id": est.id,
                "codigo_estudiante": est.codigo_estudiante,
                "nombre": est.nombre,
                "apellidos": est.apellidos,
                "email_institucional": est.email_institucional,
                "documento_numero": est.documento_numero,
                "programa_academico": est.programa_academico,
                "semestre": est.semestre,
                "estado": est.estado.value,
                "activo": est.activo,
                "created_at": est.created_at.isoformat(),
                "updated_at": est.updated_at.isoformat()
            })
        
        return estudiantes_response
    except Exception as e:
        print(f"Error listing students: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/coordinador/registrar-estudiante", response_model=EstudianteValidoResponse)
async def registrar_estudiante(
    estudiante_data: EstudianteValidoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registrar un nuevo estudiante válido"""
    try:
        # Generate unique code
        codigo_estudiante = EstudianteValido.generar_codigo_unico()
        
        # Create student
        nuevo_estudiante = EstudianteValido(
            codigo_estudiante=codigo_estudiante,
            nombre=estudiante_data.nombre,
            apellidos=estudiante_data.apellidos,
            email_institucional=estudiante_data.email_institucional,
            documento_numero=estudiante_data.documento_numero,
            programa_academico="Derecho",
            semestre=estudiante_data.semestre,
            estado=EstadoRegistro.PENDIENTE,
            activo=True
        )
        
        db.add(nuevo_estudiante)
        db.commit()
        db.refresh(nuevo_estudiante)
        
        return {
            "id": nuevo_estudiante.id,
            "codigo_estudiante": nuevo_estudiante.codigo_estudiante,
            "nombre": nuevo_estudiante.nombre,
            "apellidos": nuevo_estudiante.apellidos,
            "email_institucional": nuevo_estudiante.email_institucional,
            "documento_numero": nuevo_estudiante.documento_numero,
            "programa_academico": nuevo_estudiante.programa_academico,
            "semestre": nuevo_estudiante.semestre,
            "estado": nuevo_estudiante.estado.value,
            "activo": nuevo_estudiante.activo,
            "created_at": nuevo_estudiante.created_at.isoformat(),
            "updated_at": nuevo_estudiante.updated_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error creating student: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/auth/coordinador/estudiante/{estudiante_id}", response_model=EstudianteValidoResponse)
async def actualizar_estudiante(
    estudiante_id: int,
    estudiante_data: EstudianteValidoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar un estudiante existente"""
    try:
        estudiante = db.query(EstudianteValido).filter(EstudianteValido.id == estudiante_id).first()
        if not estudiante:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
        estudiante.nombre = estudiante_data.nombre
        estudiante.apellidos = estudiante_data.apellidos
        estudiante.email_institucional = estudiante_data.email_institucional
        estudiante.documento_numero = estudiante_data.documento_numero
        estudiante.semestre = estudiante_data.semestre
        
        db.commit()
        db.refresh(estudiante)
        
        return {
            "id": estudiante.id,
            "codigo_estudiante": estudiante.codigo_estudiante,
            "nombre": estudiante.nombre,
            "apellidos": estudiante.apellidos,
            "email_institucional": estudiante.email_institucional,
            "documento_numero": estudiante.documento_numero,
            "programa_academico": estudiante.programa_academico,
            "semestre": estudiante.semestre,
            "estado": estudiante.estado.value,
            "activo": estudiante.activo,
            "created_at": estudiante.created_at.isoformat(),
            "updated_at": estudiante.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating student: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/auth/coordinador/estudiante/{estudiante_id}")
async def eliminar_estudiante(
    estudiante_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar un estudiante de ambas tablas (estudiantes_validos y users si existe)"""
    try:
        # Buscar el estudiante en la tabla estudiantes_validos
        estudiante = db.query(EstudianteValido).filter(EstudianteValido.id == estudiante_id).first()
        if not estudiante:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")
        
        # Buscar si el estudiante ya se registró en la tabla users
        user_registrado = db.query(User).filter(User.codigo_estudiante == estudiante.codigo_estudiante).first()
        
        # Eliminar de la tabla users si existe
        if user_registrado:
            print(f"Eliminando usuario registrado: {user_registrado.email}")
            db.delete(user_registrado)
        
        # Eliminar de la tabla estudiantes_validos
        print(f"Eliminando estudiante válido: {estudiante.codigo_estudiante}")
        db.delete(estudiante)
        
        db.commit()
        
        mensaje = "Estudiante eliminado correctamente"
        if user_registrado:
            mensaje += " (incluida cuenta de usuario registrada)"
        
        return {"detail": mensaje}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting student: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA
# =============================================================================

@app.post("/api/auth/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Enviar email de recuperación de contraseña"""
    try:
        email = SecurityConfig.sanitize_input(request.email.lower(), 255)
        
        user = db.query(User).filter(
            User.email == email,
            User.activo == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No se encontró una cuenta con este email"
            )
        
        # Generar token de recuperación
        reset_token = ''.join(random.choices(string.digits, k=6))
        
        try:
            # Invalidar tokens anteriores
            db.query(PasswordResetToken).filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used == False
            ).update({"used": True})
            
            # Crear nuevo token
            db_token = PasswordResetToken.create_token(
                user_id=user.id,
                email=email,
                token=reset_token,
                expires_in_minutes=15
            )
            
            db.add(db_token)
            db.commit()
        except Exception as db_error:
            print(f"⚠️ Error en base de datos (continuando en modo desarrollo): {db_error}")
        
        # Enviar email
        email_sent = await email_service.send_password_reset_email(
            to_email=email,
            user_name=user.nombre_completo,
            reset_token=reset_token
        )
        
        if not email_sent:
            print(f"⚠️ Falló el envío de email para {email}")
        
        return {
            "message": "Email de recuperación enviado exitosamente",
            "email": email,
            "reset_token": reset_token  # Para pruebas - en producción quitar
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado en forgot_password: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error inesperado. Inténtalo de nuevo.")

@app.post("/api/auth/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Restablecer contraseña usando token"""
    try:
        email = SecurityConfig.sanitize_input(request.email.lower(), 255)
        token = SecurityConfig.sanitize_input(request.token, 10)
        
        user = db.query(User).filter(
            User.email == email,
            User.activo == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Solicitud de recuperación no encontrada"
            )
        
        # Validar token
        token_valid = False
        try:
            reset_token = db.query(PasswordResetToken).filter(
                PasswordResetToken.email == email,
                PasswordResetToken.token == token,
                PasswordResetToken.used == False
            ).first()
            
            if reset_token and not reset_token.is_expired() and reset_token.user_id == user.id:
                token_valid = True
                reset_token.used = True
                
                db.query(PasswordResetToken).filter(
                    PasswordResetToken.user_id == user.id,
                    PasswordResetToken.used == False,
                    PasswordResetToken.id != reset_token.id
                ).update({"used": True})
            
        except Exception as db_error:
            print(f"⚠️ Error en validación de token (usando validación simple): {db_error}")
            token_valid = token and len(token) == 6 and token.isdigit()
        
        if not token_valid:
            raise HTTPException(
                status_code=400,
                detail="Código de verificación inválido o expirado"
            )
        
        # Verificar fortaleza de contraseña
        password_check = SecurityConfig.check_password_strength(request.new_password)
        if not password_check["valid"]:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "La contraseña no cumple con los requisitos de seguridad",
                    "requirements": password_check["messages"]
                }
            )
        
        # Actualizar contraseña
        user.password_hash = SecurityConfig.get_password_hash(request.new_password)
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "Contraseña cambiada exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado en reset_password: {e}")
        raise HTTPException(status_code=500, detail="Ocurrió un error inesperado. Inténtalo de nuevo.")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8005))
    uvicorn.run("simple_server:app", host="0.0.0.0", port=port, reload=True)