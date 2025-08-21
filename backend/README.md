# 📖 App Derecho - Sistema de Gestión Jurídica

Sistema completo de gestión jurídica desarrollado en Python con FastAPI, SQLite y autenticación JWT para estudiantes y coordinadores.

## 🎯 Descripción del Proyecto

**App Derecho** es una aplicación web diseñada para la gestión académica de la Facultad de Derecho, que permite:

- ✅ **Gestión de estudiantes** con pre-registro y validación
- ✅ **Autenticación JWT** para coordinadores y estudiantes
- ✅ **Dashboard personalizado** por roles
- ✅ **Recuperación de contraseñas** con tokens seguros
- ✅ **Base de datos SQLite** ligera y eficiente

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                        │
│  Dashboard │ Auth │ Gestión │ Validación │ Estudiantes     │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST API (FastAPI)
                              │
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                        │
│  Auth │ JWT │ Roles │ Email │ Validación │ CRUD            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (SQLite)                          │
│   users │ estudiantes_validos │ password_reset_tokens      │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para manejo de base de datos
- **SQLite** - Base de datos ligera
- **JWT** - Autenticación con tokens seguros
- **Pydantic** - Validación de datos
- **Bcrypt** - Hash de contraseñas
- **Email** - Servicio de envío de correos

## 📋 Requisitos

- ✅ **Python 3.11+**
- ✅ **pip** (gestor de paquetes Python)

## 🚀 Instalación y Configuración

### 1. Clonar Repositorio
```bash
git clone <repository-url>
cd app_Derecho/backend
```

### 2. Crear Entorno Virtual
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con tu configuración
```

### 5. Inicializar Base de Datos
```bash
python simple_server.py
# La base de datos SQLite se crea automáticamente
```

## ⚡ Ejecución

### Desarrollo
```bash
python simple_server.py
```

La API estará disponible en: http://localhost:8005

### Documentación API
- **Swagger UI**: http://localhost:8005/docs
- **ReDoc**: http://localhost:8005/redoc

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── config/
│   │   ├── auth.py          # Configuración JWT y seguridad
│   │   └── database.py      # Configuración SQLite
│   ├── models/
│   │   ├── user.py          # Modelo de usuarios
│   │   ├── estudiante_valido.py  # Modelo de estudiantes
│   │   └── password_reset.py     # Modelo de tokens
│   ├── routes/
│   │   └── auth.py          # Rutas de autenticación
│   ├── services/
│   │   └── email_service.py # Servicio de email
│   └── middleware/
│       └── auth.py          # Middleware de autenticación
├── simple_server.py         # Servidor principal
├── requirements.txt         # Dependencias
├── app_derecho.db          # Base de datos SQLite
└── README.md
```

## 🔐 Funcionalidades de Autenticación

### Coordinador
- ✅ Login con email y contraseña
- ✅ Gestión completa de estudiantes (CRUD)
- ✅ Pre-registro de estudiantes válidos
- ✅ Dashboard con estadísticas

### Estudiante
- ✅ Registro con validación de datos personales
- ✅ Login después de registro
- ✅ Dashboard personalizado
- ✅ Recuperación de contraseña

## 🗄️ Base de Datos SQLite

### Tablas Principales
- **users**: Usuarios del sistema (coordinadores y estudiantes)
- **estudiantes_validos**: Pre-registro de estudiantes por coordinador
- **password_reset_tokens**: Tokens de recuperación de contraseña

### Respaldo
```bash
cp app_derecho.db app_derecho.db.backup
```

## 📡 API Endpoints

### Autenticación
```
POST /api/auth/login                    # Login general
POST /api/auth/forgot-password          # Solicitar recuperación
POST /api/auth/reset-password           # Restablecer contraseña
```

### Estudiantes
```
POST /api/auth/validar-datos-personales # Validar datos
POST /api/auth/registro-estudiante      # Registro estudiante
```

### Coordinador
```
GET  /api/auth/coordinador/estudiantes  # Listar estudiantes
POST /api/auth/coordinador/estudiante   # Crear estudiante
PUT  /api/auth/coordinador/estudiante/{id}    # Actualizar
DELETE /api/auth/coordinador/estudiante/{id}  # Eliminar
```

## 🧪 Testing

```bash
# Verificar API
curl -X GET http://localhost:8005/docs

# Test login
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@email.com", "password": "password"}'
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno (.env)
```
DATABASE_URL=sqlite:///./app_derecho.db
JWT_SECRET=your-super-secret-key
JWT_ACCESS_TOKEN_EXPIRE_HOURS=24
DEBUG=True
```

## 📝 Logs y Debugging

Los logs se muestran en consola durante desarrollo:
```bash
python simple_server.py
# INFO: Uvicorn running on http://0.0.0.0:8005
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

---

**Desarrollado con ❤️ para la Universidad Colegio Mayor de Cundinamarca**