-- Script para restaurar la estructura completa de la base de datos

-- Eliminar todas las tablas existentes
DROP TABLE IF EXISTS controles_operativos;
DROP TABLE IF EXISTS solicitudes_conciliacion;
DROP TABLE IF EXISTS case_actions;
DROP TABLE IF EXISTS case_documents;
DROP TABLE IF EXISTS case_secondary_lawyers;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS estudiantes_validos;
DROP TABLE IF EXISTS users;

-- Crear tabla users
CREATE TABLE users (
    id INTEGER NOT NULL, 
    nombre VARCHAR(100) NOT NULL, 
    apellidos VARCHAR(100) NOT NULL, 
    email VARCHAR(255) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    role VARCHAR(11) NOT NULL, 
    codigo_estudiante VARCHAR(20), 
    programa_academico VARCHAR(200), 
    semestre INTEGER, 
    documento_numero VARCHAR(20), 
    telefono VARCHAR(20), 
    direccion TEXT, 
    activo BOOLEAN NOT NULL, 
    email_verificado BOOLEAN NOT NULL, 
    ultimo_acceso DATETIME, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (codigo_estudiante)
);

CREATE INDEX ix_users_documento_numero ON users (documento_numero);
CREATE INDEX ix_users_id ON users (id);
CREATE UNIQUE INDEX ix_users_email ON users (email);

-- Crear tabla estudiantes_validos
CREATE TABLE estudiantes_validos (
    id INTEGER NOT NULL, 
    nombre VARCHAR(100) NOT NULL, 
    apellidos VARCHAR(100) NOT NULL, 
    documento_numero VARCHAR(20) NOT NULL, 
    codigo_estudiante VARCHAR(20) NOT NULL, 
    programa_academico VARCHAR(200) NOT NULL, 
    semestre INTEGER NOT NULL, 
    telefono VARCHAR(20), 
    email_institucional VARCHAR(255), 
    activo BOOLEAN NOT NULL, 
    usado BOOLEAN NOT NULL, 
    fecha_uso DATETIME, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (documento_numero), 
    UNIQUE (codigo_estudiante)
);

CREATE INDEX ix_estudiantes_validos_id ON estudiantes_validos (id);

-- Crear tabla password_reset_tokens
CREATE TABLE password_reset_tokens (
    id INTEGER NOT NULL, 
    email VARCHAR(255) NOT NULL, 
    token VARCHAR(255) NOT NULL, 
    expires_at DATETIME NOT NULL, 
    used BOOLEAN NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (token)
);

CREATE INDEX ix_password_reset_tokens_id ON password_reset_tokens (id);

-- Crear tabla clients
CREATE TABLE clients (
    id INTEGER NOT NULL, 
    nombre VARCHAR(100) NOT NULL, 
    apellidos VARCHAR(100) NOT NULL, 
    documento_numero VARCHAR(20) NOT NULL, 
    tipo_documento VARCHAR(20) NOT NULL, 
    telefono VARCHAR(20), 
    email VARCHAR(255), 
    direccion TEXT, 
    ciudad VARCHAR(100), 
    fecha_nacimiento DATE, 
    ocupacion VARCHAR(200), 
    estado_civil VARCHAR(20), 
    activo BOOLEAN NOT NULL, 
    notas TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    created_by INTEGER NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (documento_numero), 
    FOREIGN KEY(created_by) REFERENCES users (id)
);

CREATE INDEX ix_clients_id ON clients (id);

-- Crear tabla cases
CREATE TABLE cases (
    id INTEGER NOT NULL, 
    numero_caso VARCHAR(50) NOT NULL, 
    titulo VARCHAR(255) NOT NULL, 
    descripcion TEXT NOT NULL, 
    tipo_caso VARCHAR(50) NOT NULL, 
    estado VARCHAR(20) NOT NULL, 
    prioridad VARCHAR(10) NOT NULL, 
    fecha_inicio DATE NOT NULL, 
    fecha_limite DATE, 
    fecha_cierre DATE, 
    cliente_id INTEGER NOT NULL, 
    abogado_principal_id INTEGER NOT NULL, 
    cuantia NUMERIC(15, 2), 
    activo BOOLEAN NOT NULL, 
    observaciones TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (numero_caso), 
    FOREIGN KEY(cliente_id) REFERENCES clients (id), 
    FOREIGN KEY(abogado_principal_id) REFERENCES users (id)
);

CREATE INDEX ix_cases_id ON cases (id);

-- Crear tabla documents
CREATE TABLE documents (
    id INTEGER NOT NULL, 
    nombre VARCHAR(255) NOT NULL, 
    tipo VARCHAR(50) NOT NULL, 
    ruta_archivo VARCHAR(500) NOT NULL, 
    tamaño_archivo BIGINT NOT NULL, 
    mime_type VARCHAR(100) NOT NULL, 
    descripcion TEXT, 
    fecha_creacion DATE NOT NULL, 
    activo BOOLEAN NOT NULL, 
    created_by INTEGER NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by) REFERENCES users (id)
);

CREATE INDEX ix_documents_id ON documents (id);

-- Crear tabla case_secondary_lawyers
CREATE TABLE case_secondary_lawyers (
    id INTEGER NOT NULL, 
    caso_id INTEGER NOT NULL, 
    abogado_id INTEGER NOT NULL, 
    rol VARCHAR(50) NOT NULL, 
    fecha_asignacion DATE DEFAULT CURRENT_DATE NOT NULL, 
    activo BOOLEAN NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(caso_id) REFERENCES cases (id), 
    FOREIGN KEY(abogado_id) REFERENCES users (id)
);

CREATE INDEX ix_case_secondary_lawyers_id ON case_secondary_lawyers (id);

-- Crear tabla case_documents
CREATE TABLE case_documents (
    id INTEGER NOT NULL, 
    caso_id INTEGER NOT NULL, 
    documento_id INTEGER NOT NULL, 
    categoria VARCHAR(100), 
    fecha_vinculacion DATE DEFAULT CURRENT_DATE NOT NULL, 
    activo BOOLEAN NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(caso_id) REFERENCES cases (id), 
    FOREIGN KEY(documento_id) REFERENCES documents (id)
);

CREATE INDEX ix_case_documents_id ON case_documents (id);

-- Crear tabla case_actions
CREATE TABLE case_actions (
    id INTEGER NOT NULL, 
    caso_id INTEGER NOT NULL, 
    tipo_accion VARCHAR(50) NOT NULL, 
    descripcion TEXT NOT NULL, 
    fecha_accion DATE DEFAULT CURRENT_DATE NOT NULL, 
    hora_accion TIME, 
    usuario_id INTEGER NOT NULL, 
    estado VARCHAR(20) NOT NULL, 
    observaciones TEXT, 
    activo BOOLEAN NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(caso_id) REFERENCES cases (id), 
    FOREIGN KEY(usuario_id) REFERENCES users (id)
);

CREATE INDEX ix_case_actions_id ON case_actions (id);

-- Crear tabla solicitudes_conciliacion
CREATE TABLE solicitudes_conciliacion (
    id INTEGER NOT NULL, 
    cuantia NUMERIC(15, 2), 
    tipo_solicitud VARCHAR(12) NOT NULL, 
    estado VARCHAR(10) NOT NULL, 
    numero_radicado VARCHAR(100), 
    fecha_solicitud DATE DEFAULT CURRENT_DATE NOT NULL, 
    fecha_respuesta DATE, 
    fecha_audiencia DATETIME, 
    cliente_id INTEGER NOT NULL, 
    abogado_id INTEGER, 
    caso_id INTEGER, 
    observaciones TEXT, 
    observaciones_internas TEXT, 
    activo BOOLEAN NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (numero_radicado), 
    FOREIGN KEY(cliente_id) REFERENCES clients (id), 
    FOREIGN KEY(abogado_id) REFERENCES users (id), 
    FOREIGN KEY(caso_id) REFERENCES cases (id)
);

CREATE INDEX ix_solicitudes_conciliacion_id ON solicitudes_conciliacion (id);

-- Crear tabla controles_operativos
CREATE TABLE controles_operativos (
    id INTEGER NOT NULL, 
    fecha_elaboracion DATE NOT NULL, 
    nombre_estudiante VARCHAR(255) NOT NULL, 
    codigo_estudiante VARCHAR(20) NOT NULL, 
    semestre_academico INTEGER NOT NULL, 
    docente_asesor VARCHAR(255), 
    coordinador_academico VARCHAR(255), 
    director_consultorio VARCHAR(255), 
    caso_asignado TEXT NOT NULL, 
    actividades_realizadas TEXT, 
    conceptos_juridicos TEXT, 
    aportes_caso TEXT, 
    conclusiones TEXT, 
    recomendaciones TEXT, 
    observaciones_coordinador TEXT, 
    observaciones_director TEXT, 
    calificacion NUMERIC(3, 1), 
    fecha_calificacion DATE, 
    documentos_adjuntos TEXT, 
    activo BOOLEAN NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    created_by INTEGER NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by) REFERENCES users (id)
);

CREATE INDEX ix_controles_operativos_id ON controles_operativos (id);