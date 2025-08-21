#!/usr/bin/env python3
"""
Script de migración para actualizar la tabla controles_operativos
con los nuevos campos según el PDF de referencia
"""
import sqlite3
import sys
from datetime import datetime

def migrate_database():
    """Migrar la base de datos a la nueva estructura"""
    db_path = 'app_derecho.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Iniciando migración de controles_operativos...")
        
        # Crear una tabla temporal con la nueva estructura
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS controles_operativos_new (
            id INTEGER PRIMARY KEY,
            -- I. DATOS DEL USUARIO
            ciudad VARCHAR(100) NOT NULL DEFAULT 'Bogotá D.C',
            fecha_dia INTEGER NOT NULL,
            fecha_mes INTEGER NOT NULL, 
            fecha_ano INTEGER NOT NULL,
            nombre_docente_responsable VARCHAR(255),
            nombre_estudiante VARCHAR(255) NOT NULL,
            area_consulta VARCHAR(100),
            
            -- II. INFORMACIÓN GENERAL DEL CONSULTANTE
            remitido_por VARCHAR(255),
            correo_electronico VARCHAR(255),
            nombre_consultante VARCHAR(255) NOT NULL,
            edad INTEGER,
            fecha_nacimiento_dia INTEGER,
            fecha_nacimiento_mes INTEGER,
            fecha_nacimiento_ano INTEGER,
            lugar_nacimiento VARCHAR(255),
            sexo VARCHAR(20),
            tipo_documento VARCHAR(10),
            numero_documento VARCHAR(20) NOT NULL,
            lugar_expedicion VARCHAR(255),
            direccion VARCHAR(255),
            barrio VARCHAR(100),
            estrato INTEGER,
            numero_telefonico VARCHAR(20),
            numero_celular VARCHAR(20),
            estado_civil VARCHAR(50),
            escolaridad VARCHAR(100),
            profesion_oficio VARCHAR(100),
            
            -- III. BREVE DESCRIPCIÓN DEL CASO
            descripcion_caso TEXT,
            
            -- IV. CONCEPTO DEL ESTUDIANTE
            concepto_estudiante TEXT,
            
            -- V. CONCEPTO DEL ASESOR JURÍDICO
            concepto_asesor TEXT,
            
            -- Campos de control
            activo BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
        ''')
        
        # Verificar si la tabla original existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='controles_operativos'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            print("📋 Migrating existing data...")
            
            # Migrar datos existentes
            cursor.execute('''
            INSERT INTO controles_operativos_new (
                id, ciudad, fecha_dia, fecha_mes, fecha_ano,
                nombre_estudiante, nombre_consultante, numero_documento,
                descripcion_caso, concepto_estudiante,
                activo, created_at, updated_at, created_by
            )
            SELECT 
                id,
                'Bogotá D.C' as ciudad,
                strftime('%d', fecha_elaboracion) as fecha_dia,
                strftime('%m', fecha_elaboracion) as fecha_mes,
                strftime('%Y', fecha_elaboracion) as fecha_ano,
                nombre_estudiante,
                COALESCE(SUBSTR(caso_asignado, 1, 100), 'Consultante') as nombre_consultante,
                COALESCE(codigo_estudiante, 'DOC000') as numero_documento,
                caso_asignado as descripcion_caso,
                conceptos_juridicos as concepto_estudiante,
                activo,
                created_at,
                updated_at,
                created_by
            FROM controles_operativos
            WHERE EXISTS (SELECT 1 FROM controles_operativos)
            ''')
            
            migrated_count = cursor.rowcount
            print(f"✅ Migrated {migrated_count} existing records")
            
            # Eliminar tabla original
            cursor.execute('DROP TABLE controles_operativos')
            
        # Renombrar tabla nueva
        cursor.execute('ALTER TABLE controles_operativos_new RENAME TO controles_operativos')
        
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verificar la nueva estructura
        cursor.execute("PRAGMA table_info(controles_operativos)")
        columns = cursor.fetchall()
        print(f"📊 New table has {len(columns)} columns:")
        for col in columns[:5]:  # Mostrar solo las primeras 5
            print(f"   - {col[1]} ({col[2]})")
        print("   ... (and more)")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
        return False
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == "__main__":
    print("🚀 Control Operativo Database Migration")
    print("=" * 50)
    
    if migrate_database():
        print("\n🎉 Migration completed successfully!")
        print("✅ The database is now ready with the new structure")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)