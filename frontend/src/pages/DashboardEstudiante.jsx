import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  UserIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const DashboardEstudiante = () => {
  const { user } = useAuth()
  const [progreso, setProgreso] = useState({
    misReportes: 0,
    ultimoReporte: null,
    estado: 'Activo'
  })
  const [recordatorios, setRecordatorios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Cargar estadísticas del estudiante
      const [estadisticasRes] = await Promise.all([
        axios.get('/api/estudiante/estadisticas')
      ])
      
      setProgreso({
        misReportes: estadisticasRes.data.controles_creados || 0,
        ultimoReporte: estadisticasRes.data.fecha_registro ? 
          new Date(estadisticasRes.data.fecha_registro).toLocaleDateString('es-ES') : 'Sin reportes',
        estado: 'Activo'
      })
      
      // Recordatorios basados en datos reales
      const recordatoriosArray = []
      if (!user?.telefono) {
        recordatoriosArray.push({ id: 1, mensaje: 'Completa tu información de perfil - agrega un teléfono', tipo: 'info' })
      }
      if (estadisticasRes.data.controles_creados === 0) {
        recordatoriosArray.push({ id: 2, mensaje: 'Crea tu primer control operativo', tipo: 'tip' })
      }
      if (recordatoriosArray.length === 0) {
        recordatoriosArray.push({ id: 3, mensaje: 'Todo está al día. ¡Excelente trabajo!', tipo: 'tip' })
      }
      
      setRecordatorios(recordatoriosArray)
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
      // Datos por defecto en caso de error
      setProgreso({
        misReportes: 0,
        ultimoReporte: 'Sin reportes',
        estado: 'Activo'
      })
      setRecordatorios([
        { id: 1, mensaje: 'Error cargando datos. Intenta refrescar la página.', tipo: 'info' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getReminderIcon = (tipo) => {
    switch (tipo) {
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      case 'tip':
        return <SparklesIcon className="h-5 w-5 text-purple-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-theme-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-purple mx-auto"></div>
          <p className="mt-4 text-theme-secondary">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-theme-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Bienvenida */}
        <div className="card-theme rounded-xl shadow-theme p-6 mb-6">
          <h1 className="text-2xl font-semibold text-theme-primary mb-2">
            Hola, {user?.nombre}
          </h1>
          <p className="text-theme-secondary">
            Tu espacio de consultoría jurídica
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mi Actividad */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-6">
                Mi Actividad
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {progreso.misReportes}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Mis Reportes
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-theme-primary mb-1">
                    {progreso.ultimoReporte}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Último Reporte
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-600 mb-1">
                    {progreso.estado}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Estado
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-theme-primary mb-1">
                    {user?.codigo_estudiante || '#EST2025'}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Código
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-6">
                Acciones Rápidas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/estudiante/control-operativo"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PlusIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Nuevo Reporte</h3>
                      <p className="text-sm text-theme-secondary">Crear control operativo</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/estudiante/mis-reportes"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Ver Mis Reportes</h3>
                      <p className="text-sm text-theme-secondary">Historial de controles</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/perfil"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Mi Perfil</h3>
                      <p className="text-sm text-theme-secondary">Configurar cuenta</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/guias"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Ayuda</h3>
                      <p className="text-sm text-theme-secondary">Soporte y guías</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Derecho */}
          <div className="space-y-6">
            
            {/* Recordatorios */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                Recordatorios
              </h2>
              
              <div className="space-y-4">
                {recordatorios.map((recordatorio) => (
                  <div key={recordatorio.id} className="flex items-start space-x-3 p-3 bg-theme-tertiary rounded-lg">
                    {getReminderIcon(recordatorio.tipo)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-theme-primary">{recordatorio.mensaje}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información Personal */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-4">
                Mi Información
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Programa</span>
                  <span className="text-sm font-medium text-theme-primary">Derecho</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Semestre</span>
                  <span className="text-sm font-medium text-theme-primary">{user?.semestre || '6°'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Estado</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Activo
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Universidad</span>
                  <span className="text-sm text-theme-muted">UCMC</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-theme">
                <Link
                  to="/perfil"
                  className="text-sm text-university-purple hover:text-purple-700 font-medium"
                >
                  Actualizar información →
                </Link>
              </div>
            </div>

            {/* Acceso Rápido */}
            <div className="bg-gradient-to-r from-university-purple to-purple-700 rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">¿Necesitas ayuda?</h3>
              <p className="text-purple-100 text-sm mb-4">
                Consulta nuestras guías o contacta con el coordinador
              </p>
              <Link
                to="/soporte"
                className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                📞 Obtener Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardEstudiante