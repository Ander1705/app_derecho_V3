from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
import os
import tempfile

# Imports del proyecto
from app.config.database import get_db
from app.middleware.auth import AuthMiddleware
from app.models.user import User, UserRole
from app.models.control_operativo import ControlOperativo
from app.services.pdf_generator import pdf_generator

router = APIRouter()

# =============================================================================
# MODELOS PYDANTIC PARA REQUESTS Y RESPONSES  
# =============================================================================

class ControlOperativoCreate(BaseModel):
    # I. DATOS DEL USUARIO
    ciudad: str = "Bogotá D.C"
    fecha_dia: int
    fecha_mes: int
    fecha_ano: int
    nombre_docente_responsable: Optional[str] = None
    nombre_estudiante: str
    area_consulta: Optional[str] = None
    
    # II. INFORMACIÓN GENERAL DEL CONSULTANTE
    remitido_por: Optional[str] = None
    correo_electronico: Optional[str] = None
    nombre_consultante: str
    edad: Optional[int] = None
    fecha_nacimiento_dia: Optional[int] = None
    fecha_nacimiento_mes: Optional[int] = None
    fecha_nacimiento_ano: Optional[int] = None
    lugar_nacimiento: Optional[str] = None
    sexo: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: str
    lugar_expedicion: Optional[str] = None
    direccion: Optional[str] = None
    barrio: Optional[str] = None
    estrato: Optional[int] = None
    numero_telefonico: Optional[str] = None
    numero_celular: Optional[str] = None
    estado_civil: Optional[str] = None
    escolaridad: Optional[str] = None
    profesion_oficio: Optional[str] = None
    
    # III. BREVE DESCRIPCIÓN DEL CASO
    descripcion_caso: Optional[str] = None
    
    # IV. CONCEPTO DEL ESTUDIANTE
    concepto_estudiante: Optional[str] = None
    
    # V. CONCEPTO DEL ASESOR JURÍDICO
    concepto_asesor: Optional[str] = None

class ControlOperativoUpdate(BaseModel):
    # I. DATOS DEL USUARIO
    ciudad: Optional[str] = None
    fecha_dia: Optional[int] = None
    fecha_mes: Optional[int] = None
    fecha_ano: Optional[int] = None
    nombre_docente_responsable: Optional[str] = None
    nombre_estudiante: Optional[str] = None
    area_consulta: Optional[str] = None
    
    # II. INFORMACIÓN GENERAL DEL CONSULTANTE
    remitido_por: Optional[str] = None
    correo_electronico: Optional[str] = None
    nombre_consultante: Optional[str] = None
    edad: Optional[int] = None
    fecha_nacimiento_dia: Optional[int] = None
    fecha_nacimiento_mes: Optional[int] = None
    fecha_nacimiento_ano: Optional[int] = None
    lugar_nacimiento: Optional[str] = None
    sexo: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    lugar_expedicion: Optional[str] = None
    direccion: Optional[str] = None
    barrio: Optional[str] = None
    estrato: Optional[int] = None
    numero_telefonico: Optional[str] = None
    numero_celular: Optional[str] = None
    estado_civil: Optional[str] = None
    escolaridad: Optional[str] = None
    profesion_oficio: Optional[str] = None
    
    # III. BREVE DESCRIPCIÓN DEL CASO
    descripcion_caso: Optional[str] = None
    
    # IV. CONCEPTO DEL ESTUDIANTE
    concepto_estudiante: Optional[str] = None
    
    # V. CONCEPTO DEL ASESOR JURÍDICO
    concepto_asesor: Optional[str] = None

class ControlOperativoResponse(BaseModel):
    id: int
    # I. DATOS DEL USUARIO
    ciudad: str
    fecha_dia: int
    fecha_mes: int
    fecha_ano: int
    nombre_docente_responsable: Optional[str]
    nombre_estudiante: str
    area_consulta: Optional[str]
    
    # II. INFORMACIÓN GENERAL DEL CONSULTANTE
    remitido_por: Optional[str]
    correo_electronico: Optional[str]
    nombre_consultante: str
    edad: Optional[int]
    fecha_nacimiento_dia: Optional[int]
    fecha_nacimiento_mes: Optional[int]
    fecha_nacimiento_ano: Optional[int]
    lugar_nacimiento: Optional[str]
    sexo: Optional[str]
    tipo_documento: Optional[str]
    numero_documento: str
    lugar_expedicion: Optional[str]
    direccion: Optional[str]
    barrio: Optional[str]
    estrato: Optional[int]
    numero_telefonico: Optional[str]
    numero_celular: Optional[str]
    estado_civil: Optional[str]
    escolaridad: Optional[str]
    profesion_oficio: Optional[str]
    
    # III. BREVE DESCRIPCIÓN DEL CASO
    descripcion_caso: Optional[str]
    
    # IV. CONCEPTO DEL ESTUDIANTE
    concepto_estudiante: Optional[str]
    
    # V. CONCEPTO DEL ASESOR JURÍDICO
    concepto_asesor: Optional[str]
    
    # Campos de control
    activo: bool
    created_at: datetime
    updated_at: datetime
    created_by: int

    model_config = {"from_attributes": True}

# =============================================================================
# ENDPOINTS CRUD
# =============================================================================

@router.post("/", response_model=ControlOperativoResponse)
async def crear_control_operativo(
    control_data: ControlOperativoCreate,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nuevo control operativo"""
    try:
        # Convertir datos a diccionario
        data_dict = control_data.model_dump()
        
        # Auto-llenar algunos campos basados en el usuario actual
        if current_user.role == UserRole.ESTUDIANTE:
            # Si es estudiante, usar sus datos
            data_dict['nombre_estudiante'] = current_user.nombre_completo
        
        # Crear el control operativo
        db_control = ControlOperativo(
            created_by=current_user.id,
            **data_dict
        )
        
        db.add(db_control)
        db.commit()
        db.refresh(db_control)
        
        return ControlOperativoResponse.model_validate(db_control)
        
    except Exception as e:
        print(f"❌ Error creando control operativo: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.get("/")
async def listar_controles_operativos(
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Listar controles operativos"""
    try:
        if current_user.role == UserRole.COORDINADOR:
            # Los coordinadores ven TODOS los controles (activos e inactivos)
            controles = db.query(ControlOperativo).order_by(
                ControlOperativo.created_at.desc()
            ).all()
            print(f"✅ Coordinador viendo {len(controles)} controles operativos (todos)")
        else:
            # Los estudiantes solo ven los suyos activos
            controles = db.query(ControlOperativo).filter(
                ControlOperativo.created_by == current_user.id,
                ControlOperativo.activo == True
            ).order_by(ControlOperativo.created_at.desc()).all()
            print(f"✅ Estudiante viendo {len(controles)} controles propios activos")
        
        # Respuesta simplificada para evitar errores de validación
        return [{
            "id": control.id,
            "ciudad": control.ciudad,
            "fecha_dia": control.fecha_dia,
            "fecha_mes": control.fecha_mes,
            "fecha_ano": control.fecha_ano,
            "nombre_docente_responsable": getattr(control, 'nombre_docente_responsable', None),
            "nombre_estudiante": control.nombre_estudiante,
            "area_consulta": getattr(control, 'area_consulta', None),
            "remitido_por": getattr(control, 'remitido_por', None),
            "correo_electronico": getattr(control, 'correo_electronico', None),
            "nombre_consultante": control.nombre_consultante,
            "edad": getattr(control, 'edad', None),
            "fecha_nacimiento_dia": getattr(control, 'fecha_nacimiento_dia', None),
            "fecha_nacimiento_mes": getattr(control, 'fecha_nacimiento_mes', None),
            "fecha_nacimiento_ano": getattr(control, 'fecha_nacimiento_ano', None),
            "lugar_nacimiento": getattr(control, 'lugar_nacimiento', None),
            "sexo": getattr(control, 'sexo', None),
            "tipo_documento": getattr(control, 'tipo_documento', None),
            "numero_documento": control.numero_documento,
            "lugar_expedicion": getattr(control, 'lugar_expedicion', None),
            "direccion": getattr(control, 'direccion', None),
            "barrio": getattr(control, 'barrio', None),
            "estrato": getattr(control, 'estrato', None),
            "numero_telefonico": getattr(control, 'numero_telefonico', None),
            "numero_celular": getattr(control, 'numero_celular', None),
            "estado_civil": getattr(control, 'estado_civil', None),
            "escolaridad": getattr(control, 'escolaridad', None),
            "profesion_oficio": getattr(control, 'profesion_oficio', None),
            "descripcion_caso": getattr(control, 'descripcion_caso', None),
            "concepto_estudiante": getattr(control, 'concepto_estudiante', None),
            "concepto_asesor": getattr(control, 'concepto_asesor', None),
            "activo": control.activo,
            "created_at": control.created_at.isoformat() if control.created_at else None,
            "updated_at": control.updated_at.isoformat() if control.updated_at else None,
            "created_by": control.created_by
        } for control in controles]
        
    except Exception as e:
        print(f"❌ Error listando controles operativos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/{control_id}")
async def obtener_control_operativo(
    control_id: int,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener control operativo por ID"""
    try:
        # Coordinadores pueden ver cualquier control (activo o inactivo)
        if current_user.role == UserRole.COORDINADOR:
            control = db.query(ControlOperativo).filter(
                ControlOperativo.id == control_id
            ).first()
        else:
            # Estudiantes solo pueden ver sus propios controles activos
            control = db.query(ControlOperativo).filter(
                ControlOperativo.id == control_id,
                ControlOperativo.created_by == current_user.id,
                ControlOperativo.activo == True
            ).first()
        
        if not control:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Control operativo no encontrado"
            )
        
        # Respuesta simplificada
        return {
            "id": control.id,
            "ciudad": control.ciudad,
            "fecha_dia": control.fecha_dia,
            "fecha_mes": control.fecha_mes,
            "fecha_ano": control.fecha_ano,
            "nombre_docente_responsable": getattr(control, 'nombre_docente_responsable', None),
            "nombre_estudiante": control.nombre_estudiante,
            "area_consulta": getattr(control, 'area_consulta', None),
            "remitido_por": getattr(control, 'remitido_por', None),
            "correo_electronico": getattr(control, 'correo_electronico', None),
            "nombre_consultante": control.nombre_consultante,
            "edad": getattr(control, 'edad', None),
            "fecha_nacimiento_dia": getattr(control, 'fecha_nacimiento_dia', None),
            "fecha_nacimiento_mes": getattr(control, 'fecha_nacimiento_mes', None),
            "fecha_nacimiento_ano": getattr(control, 'fecha_nacimiento_ano', None),
            "lugar_nacimiento": getattr(control, 'lugar_nacimiento', None),
            "sexo": getattr(control, 'sexo', None),
            "tipo_documento": getattr(control, 'tipo_documento', None),
            "numero_documento": control.numero_documento,
            "lugar_expedicion": getattr(control, 'lugar_expedicion', None),
            "direccion": getattr(control, 'direccion', None),
            "barrio": getattr(control, 'barrio', None),
            "estrato": getattr(control, 'estrato', None),
            "numero_telefonico": getattr(control, 'numero_telefonico', None),
            "numero_celular": getattr(control, 'numero_celular', None),
            "estado_civil": getattr(control, 'estado_civil', None),
            "escolaridad": getattr(control, 'escolaridad', None),
            "profesion_oficio": getattr(control, 'profesion_oficio', None),
            "descripcion_caso": getattr(control, 'descripcion_caso', None),
            "concepto_estudiante": getattr(control, 'concepto_estudiante', None),
            "concepto_asesor": getattr(control, 'concepto_asesor', None),
            "activo": control.activo,
            "created_at": control.created_at.isoformat() if control.created_at else None,
            "updated_at": control.updated_at.isoformat() if control.updated_at else None,
            "created_by": control.created_by
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error obteniendo control operativo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.put("/{control_id}")
async def actualizar_control_operativo(
    control_id: int,
    control_update: ControlOperativoUpdate,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar control operativo"""
    try:
        # Coordinadores pueden editar cualquier control (activo o inactivo)
        if current_user.role == UserRole.COORDINADOR:
            control = db.query(ControlOperativo).filter(
                ControlOperativo.id == control_id
            ).first()
        else:
            # Estudiantes no pueden editar controles operativos
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Los estudiantes no pueden editar controles operativos"
            )
        
        if not control:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Control operativo no encontrado"
            )
        
        # Solo coordinadores pueden editar (ya verificado arriba)
        
        # Actualizar campos
        update_data = control_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(control, field, value)
        
        # Actualizar timestamp
        try:
            from datetime import datetime
            control.updated_at = datetime.now()
        except:
            pass  # Si falla el timestamp, continuar con la actualización
        
        db.commit()
        db.refresh(control)
        
        print(f"✅ Control operativo {control_id} actualizado por {current_user.role} (ID: {current_user.id})")
        
        # Respuesta simplificada para evitar errores de validación
        return {
            "id": control.id,
            "ciudad": control.ciudad,
            "fecha_dia": control.fecha_dia,
            "fecha_mes": control.fecha_mes,
            "fecha_ano": control.fecha_ano,
            "nombre_estudiante": control.nombre_estudiante,
            "nombre_consultante": control.nombre_consultante,
            "numero_documento": control.numero_documento,
            "descripcion_caso": control.descripcion_caso,
            "concepto_estudiante": control.concepto_estudiante,
            "concepto_asesor": control.concepto_asesor,
            "activo": control.activo,
            "created_at": control.created_at.isoformat() if control.created_at else None,
            "updated_at": control.updated_at.isoformat() if control.updated_at else None,
            "created_by": control.created_by
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error actualizando control operativo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.delete("/{control_id}")
async def eliminar_control_operativo(
    control_id: int,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar control operativo"""
    try:
        control = db.query(ControlOperativo).filter(
            ControlOperativo.id == control_id
        ).first()
        
        if not control:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Control operativo no encontrado"
            )
        
        # Solo coordinadores pueden eliminar controles operativos
        if current_user.role != UserRole.COORDINADOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo coordinadores pueden eliminar controles operativos"
            )
        
        # Eliminación lógica
        control.activo = False
        try:
            from datetime import datetime
            control.updated_at = datetime.now()
        except:
            pass  # Si falla el timestamp, continuar con la eliminación
        
        db.commit()
        
        print(f"✅ Control operativo {control_id} eliminado por {current_user.role} (ID: {current_user.id})")
        
        return {"mensaje": "Control operativo eliminado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error eliminando control operativo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/{control_id}/reactivar")
async def reactivar_control_operativo(
    control_id: int,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Reactivar control operativo eliminado - Solo coordinadores"""
    try:
        # Solo coordinadores pueden reactivar
        if current_user.role != UserRole.COORDINADOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo coordinadores pueden reactivar controles operativos"
            )
        
        control = db.query(ControlOperativo).filter(
            ControlOperativo.id == control_id
        ).first()
        
        if not control:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Control operativo no encontrado"
            )
        
        # Reactivar el control
        control.activo = True
        try:
            from datetime import datetime
            control.updated_at = datetime.now()
        except:
            pass
        
        db.commit()
        
        print(f"✅ Control operativo {control_id} reactivado por coordinador (ID: {current_user.id})")
        
        return {"mensaje": "Control operativo reactivado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error reactivando control operativo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/{control_id}/pdf")
async def generar_pdf_control_operativo(
    control_id: int,
    current_user: User = Depends(AuthMiddleware.get_current_user),
    db: Session = Depends(get_db)
):
    """Generar y descargar PDF del control operativo"""
    try:
        # Obtener control operativo
        control = db.query(ControlOperativo).filter(
            ControlOperativo.id == control_id,
            ControlOperativo.activo == True
        ).first()
        
        if not control:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Control operativo no encontrado"
            )
        
        # Verificar permisos
        if current_user.role == UserRole.ESTUDIANTE and control.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para generar el PDF de este control operativo"
            )
        
        # Generar PDF usando el generador
        pdf_buffer = pdf_generator.generate_pdf(control)
        
        # Nombre del archivo
        fecha_str = f"{control.fecha_ano}{control.fecha_mes:02d}{control.fecha_dia:02d}" if control.fecha_ano and control.fecha_mes and control.fecha_dia else datetime.now().strftime('%Y%m%d')
        nombre_archivo = f"control_operativo_{control.id}_{fecha_str}.pdf"
        
        # Retornar el PDF como respuesta de streaming
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generando PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )