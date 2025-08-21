from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional
import random
import string

from app.config.database import get_db
from app.config.auth import SecurityConfig
from app.middleware.auth import AuthMiddleware
from app.models.user import User, UserRole
from app.models.password_reset import PasswordResetToken
from app.models.estudiante_valido import EstudianteValido, EstadoRegistro
from app.services.email_service import email_service

router = APIRouter()

# =============================================================================
# MODELOS PYDANTIC PARA REQUESTS Y RESPONSES
# =============================================================================

class ValidarCodigoRequest(BaseModel):
    codigo_estudiante: str

class ValidarDatosPersonalesRequest(BaseModel):
    documento_numero: str

class ValidarCodigoResponse(BaseModel):
    valido: bool
    estudiante: Optional[dict] = None
    mensaje: str

class RegistroEstudianteRequest(BaseModel):
    codigo_estudiante: str
    nombre: str
    apellidos: str
    password: str
    telefono: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    apellidos: str
    email: str
    role: UserRole
    codigo_estudiante: Optional[str] = None
    programa_academico: Optional[str] = None
    semestre: Optional[int] = None
    telefono: Optional[str] = None
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str

# =============================================================================
# ENDPOINTS PARA ESTUDIANTES
# =============================================================================

@router.post("/validar-codigo", response_model=ValidarCodigoResponse)
async def validar_codigo_estudiante(
    request: ValidarCodigoRequest,
    db: Session = Depends(get_db)
):
    """Validar código de estudiante para registro"""
    try:
        # Buscar estudiante válido con el código
        estudiante = db.query(EstudianteValido).filter(
            EstudianteValido.codigo_estudiante == request.codigo_estudiante.upper(),
            EstudianteValido.activo == True
        ).first()
        
        if not estudiante:
            return ValidarCodigoResponse(
                valido=False,
                mensaje="❌ Código de estudiante no válido. Contacta al coordinador."
            )
        
        if estudiante.estado == EstadoRegistro.REGISTRADO:
            return ValidarCodigoResponse(
                valido=False,
                mensaje="❌ Este código ya fue utilizado para crear una cuenta."
            )
        
        # Código válido
        return ValidarCodigoResponse(
            valido=True,
            estudiante={
                "nombre": estudiante.nombre,
                "apellidos": estudiante.apellidos,
                "email_institucional": estudiante.email_institucional,
                "programa_academico": estudiante.programa_academico,
                "semestre": estudiante.semestre,
                "codigo_estudiante": estudiante.codigo_estudiante
            },
            mensaje="✅ Código válido. Puedes completar tu registro."
        )
        
    except Exception as e:
        print(f"❌ Error en validación de código: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )

@router.post("/validar-datos-personales", response_model=ValidarCodigoResponse)
async def validar_datos_personales(
    request: ValidarDatosPersonalesRequest,
    db: Session = Depends(get_db)
):
    """Validar estudiante por número de identificación para registro"""
    try:
        # Buscar estudiante válido solo por número de documento
        estudiante = db.query(EstudianteValido).filter(
            EstudianteValido.documento_numero == request.documento_numero.strip(),
            EstudianteValido.activo == True
        ).first()
        
        if not estudiante:
            return ValidarCodigoResponse(
                valido=False,
                mensaje="❌ No se encontró un estudiante pre-registrado con este número de identificación. Contacta al coordinador."
            )
        
        if estudiante.estado == EstadoRegistro.REGISTRADO:
            return ValidarCodigoResponse(
                valido=False,
                mensaje="❌ Este estudiante ya ha completado su registro."
            )
        
        # Datos válidos - devolver información para que el estudiante complete nombres y apellidos
        return ValidarCodigoResponse(
            valido=True,
            estudiante={
                "nombre": estudiante.nombre,  # Para mostrar como placeholder/sugerencia
                "apellidos": estudiante.apellidos,  # Para mostrar como placeholder/sugerencia
                "email_institucional": estudiante.email_institucional,
                "programa_academico": estudiante.programa_academico,
                "semestre": estudiante.semestre,
                "codigo_estudiante": estudiante.codigo_estudiante,
                "documento_numero": estudiante.documento_numero
            },
            mensaje="✅ Estudiante encontrado. Completa tu información personal para continuar con el registro."
        )
        
    except Exception as e:
        print(f"❌ Error en validación por documento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )

@router.post("/registro-estudiante")
async def registrar_estudiante(
    request: RegistroEstudianteRequest,
    db: Session = Depends(get_db)
):
    """Completar registro de estudiante usando código válido"""
    try:
        # Volver a validar el código
        estudiante = db.query(EstudianteValido).filter(
            EstudianteValido.codigo_estudiante == request.codigo_estudiante.upper(),
            EstudianteValido.activo == True,
            EstudianteValido.estado == EstadoRegistro.PENDIENTE
        ).first()
        
        if not estudiante:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Código no válido o ya utilizado."
            )
        
        # Verificar que no exista usuario con el mismo email
        existing_user = db.query(User).filter(User.email == estudiante.email_institucional).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="❌ Ya existe una cuenta con este correo electrónico."
            )
        
        # Validar contraseña
        password_check = SecurityConfig.check_password_strength(request.password)
        if not password_check["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "La contraseña no cumple con los requisitos de seguridad",
                    "requirements": password_check["messages"]
                }
            )
        
        # Crear usuario estudiante con nombres y apellidos proporcionados
        db_user = User(
            nombre=request.nombre.strip(),  # Usar nombres del formulario
            apellidos=request.apellidos.strip(),  # Usar apellidos del formulario
            email=estudiante.email_institucional,
            password_hash=SecurityConfig.get_password_hash(request.password),
            role=UserRole.ESTUDIANTE,
            codigo_estudiante=estudiante.codigo_estudiante,
            programa_academico=estudiante.programa_academico,
            semestre=estudiante.semestre,
            documento_numero=estudiante.documento_numero,
            telefono=request.telefono,
            activo=True,
            email_verificado=True
        )
        
        db.add(db_user)
        
        # Actualizar estado del estudiante a registrado
        estudiante.estado = EstadoRegistro.REGISTRADO
        
        db.commit()
        db.refresh(db_user)
        
        # Generar tokens
        access_token = SecurityConfig.create_access_token(
            data={"sub": str(db_user.id)}, 
            token_type="access"
        )
        refresh_token = SecurityConfig.create_access_token(
            data={"sub": str(db_user.id)}, 
            token_type="refresh"
        )
        
        # Respuesta simplificada sin modelo complejo
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "nombre": db_user.nombre,
                "apellidos": db_user.apellidos,
                "email": db_user.email,
                "role": db_user.role,
                "codigo_estudiante": db_user.codigo_estudiante,
                "programa_academico": db_user.programa_academico,
                "semestre": db_user.semestre,
                "telefono": db_user.telefono,
                "activo": db_user.activo,
                "created_at": db_user.created_at.isoformat() if db_user.created_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en registro de estudiante: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )

# =============================================================================
# ENDPOINTS GENERALES DE AUTENTICACIÓN
# =============================================================================

@router.post("/login")
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Iniciar sesión - Sistema renovado y robusto"""
    try:
        # Sanitizar email
        email = user_credentials.email.lower().strip()
        
        # Buscar usuario
        user = db.query(User).filter(
            User.email == email,
            User.activo == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Verificar contraseña con nuevo sistema
        if not SecurityConfig.verify_password(user_credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Generar tokens
        access_token = SecurityConfig.create_access_token(
            data={"sub": str(user.id)}, 
            token_type="access"
        )
        refresh_token = SecurityConfig.create_access_token(
            data={"sub": str(user.id)}, 
            token_type="refresh"
        )
        
        # Respuesta simplificada pero completa
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "nombre": user.nombre,
                "apellidos": user.apellidos,
                "email": user.email,
                "role": user.role,
                "codigo_estudiante": getattr(user, 'codigo_estudiante', None),
                "programa_academico": getattr(user, 'programa_academico', None),
                "semestre": getattr(user, 'semestre', None),
                "telefono": getattr(user, 'telefono', None),
                "activo": user.activo,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en login: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(AuthMiddleware.get_current_user)):
    """Obtener información del usuario actual"""
    return UserResponse.model_validate(current_user)

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Cambiar contraseña"""
    
    # Verificar contraseña actual
    if not SecurityConfig.verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
    
    # Verificar fortaleza de nueva contraseña
    password_check = SecurityConfig.check_password_strength(password_data.new_password)
    if not password_check["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "La nueva contraseña no cumple con los requisitos de seguridad",
                "requirements": password_check["messages"]
            }
        )
    
    # Actualizar contraseña
    current_user.password_hash = SecurityConfig.get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Contraseña cambiada exitosamente"}

@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Renovar token de acceso"""
    try:
        payload = SecurityConfig.decode_token(refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tipo de token inválido"
            )
        
        user = db.query(User).filter(
            User.id == user_id,
            User.activo == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        # Generar nuevo token de acceso
        new_access_token = SecurityConfig.create_access_token(
            data={"sub": str(user.id)}, 
            token_type="access"
        )
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de renovación inválido"
        )

# =============================================================================
# ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA
# =============================================================================

@router.post("/forgot-password")
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
                status_code=status.HTTP_404_NOT_FOUND,
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
            "reset_token": reset_token if SecurityConfig.DEBUG else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado en forgot_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error inesperado. Inténtalo de nuevo."
        )

@router.post("/reset-password")
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
                status_code=status.HTTP_404_NOT_FOUND,
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
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Código de verificación inválido o expirado"
            )
        
        # Verificar fortaleza de contraseña
        password_check = SecurityConfig.check_password_strength(request.new_password)
        if not password_check["valid"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error inesperado. Inténtalo de nuevo."
        )

# =============================================================================
# ENDPOINTS PARA COORDINADOR
# =============================================================================

class RegistrarEstudianteCoordinadorRequest(BaseModel):
    nombre: str
    apellidos: str
    email_institucional: EmailStr
    documento_numero: str
    semestre: int

class EstudianteValidoResponse(BaseModel):
    id: int
    codigo_estudiante: str
    nombre: str
    apellidos: str
    email_institucional: str
    documento_numero: str
    programa_academico: str
    semestre: int
    estado: EstadoRegistro
    created_at: datetime

    model_config = {"from_attributes": True}

def verificar_coordinador(current_user: User = Depends(AuthMiddleware.get_current_user)):
    """Middleware para verificar que el usuario es coordinador"""
    if current_user.role != UserRole.COORDINADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="❌ Solo el coordinador puede realizar esta acción."
        )
    return current_user

@router.post("/coordinador/registrar-estudiante", response_model=EstudianteValidoResponse)
async def registrar_estudiante_por_coordinador(
    request: RegistrarEstudianteCoordinadorRequest,
    current_user: User = Depends(verificar_coordinador),
    db: Session = Depends(get_db)
):
    """Pre-registrar estudiante por el coordinador"""
    try:
        # Verificar documento único
        existing_documento = db.query(EstudianteValido).filter(
            EstudianteValido.documento_numero == request.documento_numero
        ).first()
        
        if existing_documento:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"❌ Ya existe un estudiante con el documento {request.documento_numero}."
            )
        
        # Verificar email único
        existing_email = db.query(EstudianteValido).filter(
            EstudianteValido.email_institucional == request.email_institucional.lower()
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"❌ Ya existe un estudiante con el email {request.email_institucional}."
            )
        
        # Generar código único de estudiante
        codigo_estudiante = EstudianteValido.generar_codigo_unico()
        
        # Verificar que el código no exista (muy improbable pero por seguridad)
        while db.query(EstudianteValido).filter(EstudianteValido.codigo_estudiante == codigo_estudiante).first():
            codigo_estudiante = EstudianteValido.generar_codigo_unico()
        
        # Crear estudiante válido
        nuevo_estudiante = EstudianteValido(
            codigo_estudiante=codigo_estudiante,
            nombre=request.nombre,
            apellidos=request.apellidos,
            email_institucional=request.email_institucional.lower(),
            documento_numero=request.documento_numero,
            programa_academico="Derecho",  # Fijo para todos
            semestre=request.semestre,
            estado=EstadoRegistro.PENDIENTE,
            activo=True
        )
        
        db.add(nuevo_estudiante)
        db.commit()
        db.refresh(nuevo_estudiante)
        
        return EstudianteValidoResponse.model_validate(nuevo_estudiante)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error registrando estudiante: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )

@router.get("/coordinador/estudiantes", response_model=list[EstudianteValidoResponse])
async def listar_estudiantes(
    current_user: User = Depends(verificar_coordinador),
    db: Session = Depends(get_db)
):
    """Listar todos los estudiantes pre-registrados"""
    try:
        estudiantes = db.query(EstudianteValido).order_by(EstudianteValido.created_at.desc()).all()
        return [EstudianteValidoResponse.model_validate(est) for est in estudiantes]
        
    except Exception as e:
        print(f"❌ Error listando estudiantes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )

@router.delete("/coordinador/estudiante/{estudiante_id}")
async def eliminar_estudiante(
    estudiante_id: int,
    current_user: User = Depends(verificar_coordinador),
    db: Session = Depends(get_db)
):
    """Eliminar estudiante pre-registrado"""
    try:
        estudiante = db.query(EstudianteValido).filter(EstudianteValido.id == estudiante_id).first()
        
        if not estudiante:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ Estudiante no encontrado."
            )
        
        # Si el estudiante ya se registró, también eliminar el usuario
        if estudiante.estado == EstadoRegistro.REGISTRADO:
            usuario = db.query(User).filter(User.codigo_estudiante == estudiante.codigo_estudiante).first()
            if usuario:
                db.delete(usuario)
        
        db.delete(estudiante)
        db.commit()
        
        return {"mensaje": "✅ Estudiante eliminado correctamente."}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error eliminando estudiante: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )

@router.put("/coordinador/estudiante/{estudiante_id}", response_model=EstudianteValidoResponse)
async def actualizar_estudiante(
    estudiante_id: int,
    request: RegistrarEstudianteCoordinadorRequest,
    current_user: User = Depends(verificar_coordinador),
    db: Session = Depends(get_db)
):
    """Actualizar estudiante pre-registrado"""
    try:
        estudiante = db.query(EstudianteValido).filter(EstudianteValido.id == estudiante_id).first()
        
        if not estudiante:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="❌ Estudiante no encontrado."
            )
        
        # Verificar unicidad de documento (excepto el actual)
        existing_documento = db.query(EstudianteValido).filter(
            EstudianteValido.documento_numero == request.documento_numero,
            EstudianteValido.id != estudiante_id
        ).first()
        
        if existing_documento:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"❌ Ya existe otro estudiante con el documento {request.documento_numero}."
            )
        
        # Verificar unicidad de email (excepto el actual)
        existing_email = db.query(EstudianteValido).filter(
            EstudianteValido.email_institucional == request.email_institucional.lower(),
            EstudianteValido.id != estudiante_id
        ).first()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"❌ Ya existe otro estudiante con el email {request.email_institucional}."
            )
        
        # Actualizar datos
        estudiante.nombre = request.nombre
        estudiante.apellidos = request.apellidos
        estudiante.email_institucional = request.email_institucional.lower()
        estudiante.documento_numero = request.documento_numero
        estudiante.semestre = request.semestre
        
        # Si el estudiante ya tiene usuario creado, también actualizar el usuario
        if estudiante.estado == EstadoRegistro.REGISTRADO:
            usuario = db.query(User).filter(User.codigo_estudiante == estudiante.codigo_estudiante).first()
            if usuario:
                usuario.nombre = request.nombre
                usuario.apellidos = request.apellidos
                usuario.email = request.email_institucional.lower()
                usuario.documento_numero = request.documento_numero
                usuario.semestre = request.semestre
        
        db.commit()
        db.refresh(estudiante)
        
        return EstudianteValidoResponse.model_validate(estudiante)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error actualizando estudiante: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Inténtalo nuevamente."
        )