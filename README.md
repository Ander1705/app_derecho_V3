# 🏛️ Sistema Jurídico Universitario

**Plataforma completa de gestión jurídica** desarrollada específicamente para la **Facultad de Derecho de la Universidad Colegio Mayor de Cundinamarca** con arquitectura moderna full-stack, diseño corporativo profesional y funcionalidades especializadas para la gestión legal académica y práctica.

## 📋 **Estado Actual del Proyecto**

El sistema está completamente funcional con SQLite como base de datos, con backend FastAPI y frontend React. Ha sido optimizado y limpiado siguiendo las especificaciones del archivo `claude.md`.

### **🎯 Propósito y Objetivos**
- **🏛️ Digitalización** de procesos legales universitarios
- **📋 Gestión centralizada** de estudiantes y coordinadores
- **🎓 Herramienta educativa** para estudiantes de derecho
- **👥 Colaboración** entre profesores, estudiantes y personal administrativo
- **🔐 Autenticación segura** con roles diferenciados

### **🔧 Componentes Principales**
- **Backend API**: FastAPI + Python + SQLite para lógica de negocio
- **Frontend Web**: React + Vite + Tailwind para interfaz de usuario
- **Base de Datos**: SQLite con schema jurídico simplificado
- **Autenticación**: JWT con roles (coordinador, estudiante)

---

## 🚀 **Guía de Instalación Paso a Paso**

### **📋 Requisitos Previos**

#### **Para todas las plataformas:**
- **Python** 3.8+ con pip
- **Node.js** 18+ y **npm** 9+ 
- **Git** para clonar el repositorio

---

## 💻 **INSTALACIÓN POR SISTEMA OPERATIVO**

### 🐧 **LINUX (Ubuntu/Debian)**

#### **1. Instalar dependencias del sistema**
```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Python y Node.js
sudo apt install python3 python3-pip python3-venv nodejs npm git -y

# Verificar versiones
python3 --version  # Debe ser 3.8+
node --version     # Debe ser 16+
npm --version      # Debe ser 8+
```

#### **2. Clonar y configurar el proyecto**
```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd app_Derecho

# Configurar Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar backend en background
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

# Configurar Frontend (nueva terminal)
cd ../frontend
npm install
npm run dev &
```

### 🍎 **macOS**

#### **1. Instalar dependencias usando Homebrew**
```bash
# Instalar Homebrew si no está instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependencias
brew install python3 node git

# Verificar versiones
python3 --version  # Debe ser 3.8+
node --version     # Debe ser 16+
npm --version      # Debe ser 8+
```

#### **2. Configurar el proyecto**
```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd app_Derecho

# Configurar Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

# Configurar Frontend (nueva terminal)
cd ../frontend
npm install
npm run dev
```

### 🪟 **WINDOWS**

#### **1. Instalar dependencias**
```powershell
# Opción A: Usando Chocolatey (recomendado)
# Instalar Chocolatey primero desde https://chocolatey.org/install
choco install python nodejs git -y

# Opción B: Descargar manualmente
# Python: https://www.python.org/downloads/
# Node.js: https://nodejs.org/
# Git: https://git-scm.com/download/win

# Verificar instalación
python --version   # Debe ser 3.8+
node --version     # Debe ser 16+
npm --version      # Debe ser 8+
```

#### **2. Configurar el proyecto**
```cmd
REM Clonar repositorio
git clone <url-del-repositorio>
cd app_Derecho

REM Configurar Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

REM Iniciar backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

```cmd
REM En una nueva ventana de comandos - Frontend
cd app_Derecho\frontend
npm install
npm run dev
```

---

## 🚀 **INICIO RÁPIDO (Después de la instalación)**

### **Comandos para iniciar ambos servicios:**

#### **Linux/macOS:**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### **Windows:**
```cmd
REM Ventana 1 - Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

REM Ventana 2 - Frontend
cd frontend
npm run dev
```

### **URLs de Acceso:**
- **🎨 Frontend**: http://localhost:3000 (o el puerto que se asigne automáticamente)
- **🔧 Backend**: http://localhost:8000
- **📚 API Docs**: http://localhost:8000/docs

---

## ✅ **Verificación de Instalación**

### **🌐 URLs de Acceso**
- **🎨 Frontend (Interfaz Usuario)**: http://localhost:3000
- **🔧 Backend API**: http://localhost:8000  
- **📚 Documentación API**: http://localhost:8000/docs
- **🗄️ Base de Datos**: SQLite en `backend/app_derecho.db`

### **👤 Credenciales de Prueba Disponibles**

#### **Coordinador (Acceso Administrativo)**
```
Email: coordinador@prueba.com
Password: password123
Rol: coordinador
```

#### **Estudiante (Acceso de Estudiante)**
```
Email: andersonmontana240@gmail.com
Password: password123
Rol: estudiante
```

### **🔍 Comandos de Verificación**

#### **Linux/macOS:**
```bash
# Verificar que el backend responde
curl http://localhost:8000/health

# Verificar endpoint de login coordinador
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "coordinador@prueba.com", "password": "password123"}'

# Verificar login estudiante
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "andersonmontana240@gmail.com", "password": "password123"}'
```

#### **Windows (PowerShell):**
```powershell
# Verificar backend
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing

# Test login coordinador
$body = @{
    email = "coordinador@prueba.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

#### **Verificar frontend:**
```bash
# Linux/macOS
curl -s http://localhost:3000 > /dev/null && echo "Frontend OK" || echo "Frontend Error"

# Windows (PowerShell)
try { Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing; "Frontend OK" } catch { "Frontend Error" }

# Verificar base de datos SQLite
python3 -c "
import sqlite3
conn = sqlite3.connect('app_derecho.db')
cursor = conn.cursor()
cursor.execute('SELECT id, nombre, apellidos, email, role FROM users')
users = cursor.fetchall()
for user in users:
    print(f'ID: {user[0]}, Nombre: {user[1]} {user[2]}, Email: {user[3]}, Role: {user[4]}')
conn.close()
"
```

---

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────────────────────────────────┐
│              FRONTEND                       │
│          React + Vite + Tailwind           │
│              Port: 3000                     │
│                                            │
│  🎨 Diseño Corporativo Universitario      │
│  📱 Responsive & Accesible                │  
│  🔐 Autenticación JWT                     │
│  ⚡ Performance Optimizado                │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────┐
│              BACKEND                        │
│         FastAPI + SQLAlchemy               │
│              Port: 8000                     │
│                                            │
│  🔒 JWT + Security Headers                │
│  📊 CRUD Complete                         │
│  🛡️ Input Validation                      │
│  🔐 bcrypt Password Hashing               │
└─────────────────┬───────────────────────────┘
                  │ SQLAlchemy ORM
┌─────────────────▼───────────────────────────┐
│              DATABASE                       │
│               SQLite                       │
│            app_derecho.db                  │
│                                            │
│  👥 Usuarios y Roles                      │
│  🎓 Estudiantes Válidos                   │
│  🔑 Tokens de Recuperación                │
│  📧 Sistema de Email                      │
└─────────────────────────────────────────────┘
```

---

## 📁 **Estructura del Proyecto**

```
app_Derecho/
├── backend/                      # 🐍 Python FastAPI
│   ├── app/
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py         # Modelo de usuarios
│   │   │   ├── estudiante_valido.py  # Estudiantes pre-registrados
│   │   │   └── password_reset.py     # Tokens de recuperación
│   │   ├── routes/              # API endpoints  
│   │   │   └── auth.py         # Rutas de autenticación
│   │   ├── services/            # Business logic
│   │   │   └── email_service.py # Servicio de email
│   │   ├── config/              # Configuration
│   │   │   ├── database.py     # Configuración SQLite
│   │   │   └── auth.py         # Configuración JWT y seguridad
│   │   └── middleware/          # Security & auth
│   ├── simple_server.py         # Servidor alternativo
│   ├── main.py                  # Servidor principal (Puerto 8000)
│   ├── requirements.txt         # Dependencias Python
│   ├── app_derecho.db          # Base de datos SQLite
│   ├── create_sqlite_tables.py  # Script crear tablas
│   ├── create_test_data.py      # Script datos de prueba
│   └── CLAUDE.md               # Especificaciones del proyecto
│
└── frontend/                     # ⚛️ React + Vite
    ├── src/
    │   ├── components/          # React components
    │   ├── pages/               # Application pages
    │   │   └── auth/           # Páginas de autenticación
    │   │       ├── Login.jsx   # Página de login
    │   │       ├── ForgotPassword.jsx
    │   │       └── ValidacionEstudiante.jsx
    │   ├── contexts/            # React contexts
    │   │   └── AuthContext.jsx # Contexto de autenticación
    │   └── utils/               # Utilities
    ├── public/                  # Static assets
    ├── tailwind.config.js       # Tailwind config
    ├── vite.config.js          # Vite config
    └── package.json            # Dependencies
```

---

## 🔧 **Scripts de Base de Datos**

### **Crear Tablas**
```bash
cd backend
python create_sqlite_tables.py
```

### **Crear Datos de Prueba**
```bash
python create_test_data.py
```

### **Limpiar Base de Datos**
```bash
python limpiar_db.py
```

### **Operaciones Manuales de Base de Datos**
```python
# Conectar a SQLite y ver usuarios
import sqlite3
conn = sqlite3.connect('app_derecho.db')
cursor = conn.cursor()

# Ver todos los usuarios
cursor.execute('SELECT id, nombre, apellidos, email, role, activo FROM users')
users = cursor.fetchall()
for user in users:
    print(f'ID: {user[0]}, Nombre: {user[1]} {user[2]}, Email: {user[3]}, Role: {user[4]}')

conn.close()
```

---

## 🚀 **Comandos de Desarrollo**

### **Backend (Python)**
```bash
cd backend
source venv/bin/activate

# Iniciar servidor principal (recomendado)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Iniciar servidor alternativo
PORT=8005 python3 simple_server.py

# Ejecutar tests
python test_complete_flow.py
python test_email_flow.py
python test_login_endpoint.py
```

### **Frontend (React)**
```bash
cd frontend

npm run dev                    # Servidor desarrollo (port 3000)
npm run build                  # Build producción
npm run preview                # Preview build
npm run lint                   # Linter ESLint
```

---

## 🔐 **Sistema de Autenticación**

### **Roles de Usuario**
- **Coordinador**: Acceso administrativo completo
- **Estudiante**: Acceso limitado de estudiante

### **Flujo de Autenticación**
1. **Login Coordinador**: Email + Password → JWT Token
2. **Registro Estudiante**: Datos personales → Validación → Registro → Auto-login
3. **Recuperación Password**: Email → Token → Nueva contraseña

### **Endpoints de Autenticación**
```bash
POST /api/auth/login                    # Login coordinador
POST /api/auth/validar-datos-personales # Validar datos estudiante
POST /api/auth/registro-estudiante      # Completar registro estudiante
POST /api/auth/forgot-password          # Solicitar recuperación
POST /api/auth/reset-password           # Cambiar contraseña
```

---

## 🧪 **Testing y Desarrollo**

### **Probar Login de Coordinador**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "coordinador@prueba.com", "password": "password123"}'
```

### **Probar Health Check**
```bash
curl http://localhost:8000/health
```

### **Ver Documentación de API**
Abrir en navegador: http://localhost:8000/docs

---

## 🎨 **Características del Frontend**

### **🏛️ Diseño Corporativo Universitario**
- **Colores**: Azul universitario, dorado y navy
- **Tipografía**: Moderna y profesional
- **Iconografía**: Heroicons
- **Responsive**: Mobile-first design

### **📱 Páginas Principales**
- **🔐 Login**: Autenticación dual (coordinador/estudiante)
- **📊 Dashboard**: Panel principal
- **👥 Gestión Estudiantes**: CRUD completo para coordinadores
- **🎓 Registro Estudiantes**: Flujo de auto-registro

---

## 🛡️ **Seguridad**

### **Backend Security**
- **JWT Tokens** con expiración
- **bcrypt** para hash de contraseñas con salt
- **Input Sanitization** anti-inyección
- **CORS** configurado correctamente
- **Rate Limiting** implementado

### **Database Security**
- **SQLite** con protección contra SQL injection
- **Passwords hasheados** nunca en texto plano
- **Tokens de recuperación** con expiración

---

## 📞 **Soporte y Troubleshooting**

### **Problemas Comunes**

#### **Backend no inicia**
```bash
# Verificar Python y dependencias
python3 --version
pip list

# Reinstalar dependencias
pip install -r requirements.txt

# Crear base de datos si no existe
python create_sqlite_tables.py
```

#### **Frontend no inicia**
```bash
# Verificar Node.js
node --version
npm --version

# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

#### **Error de CORS**
- Verificar que el backend esté en puerto 8000
- Frontend debe estar en puerto 3000
- CORS está configurado para estos puertos

#### **Error de base de datos**
```bash
# Verificar que existe la base de datos
ls -la backend/app_derecho.db

# Recrear si es necesario
cd backend
python create_sqlite_tables.py
```

### **Logs y Debugging**
- **Backend logs**: Se muestran en consola
- **Frontend logs**: Abrir DevTools del navegador
- **Database**: Usar SQLite browser o comandos Python

---

## 🎉 **Estado del Proyecto**

✅ **Backend**: FastAPI + SQLite funcionando completamente  
✅ **Frontend**: React + Tailwind con diseño corporativo  
✅ **Autenticación**: JWT completa con roles  
✅ **API**: Endpoints documentados y funcionales  
✅ **UI/UX**: Diseño profesional universitario  
✅ **Base de Datos**: SQLite con datos de prueba  
✅ **Seguridad**: bcrypt + JWT + sanitización  
✅ **Documentación**: Guías completas actualizadas  

**🏛️ Sistema listo para uso en la Facultad de Derecho**

---

## 📈 **Próximos Pasos**

1. **Completar testing** de todos los flujos
2. **Optimizar performance** del frontend
3. **Añadir más funcionalidades** según necesidades
4. **Deploy en producción** cuando esté listo
5. **Capacitación** para usuarios finales

---

**Versión**: 2.0.0 (SQLite Migration)  
**Universidad**: Facultad de Derecho - Universidad Colegio Mayor de Cundinamarca  
**Tecnologías**: Python FastAPI, React, SQLite, JWT  
**Estado**: ✅ Completamente Funcional