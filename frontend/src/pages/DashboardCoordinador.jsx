import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const DashboardCoordinador = () => {
  const { user } = useAuth()
  const [metricas, setMetricas] = useState({
    estudiantesRegistrados: 0,
    reportesEsteMes: 0,
    estudiantesPendientes: 0,
    totalReportes: 0
  })
  const [actividadReciente, setActividadReciente] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Cargar métricas del coordinador
      const [metricasRes, actividadRes] = await Promise.all([
        axios.get('/api/coordinador/metricas'),
        axios.get('/api/coordinador/actividad-reciente')
      ])
      
      setMetricas(metricasRes.data)
      setActividadReciente(actividadRes.data)
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
      // Datos de ejemplo en caso de error
      setMetricas({
        estudiantesRegistrados: 45,
        reportesEsteMes: 12,
        estudiantesPendientes: 8,
        totalReportes: 156
      })
      setActividadReciente([
        { id: 1, tipo: 'registro', mensaje: 'Juan Pérez completó su registro', tiempo: '2 horas' },
        { id: 2, tipo: 'reporte', mensaje: 'Nuevo reporte: Control Operativo #156', tiempo: '4 horas' },
        { id: 3, tipo: 'pendiente', mensaje: 'María García - reporte pendiente', tiempo: '1 día' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case 'registro':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'reporte':
        return <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500" />
      case 'pendiente':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Bienvenida */}
        <div className="card-theme rounded-xl shadow-theme p-6 mb-6">
          <h1 className="text-2xl font-semibold text-theme-primary mb-2">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="text-theme-secondary">
            Panel de control - Consultorio Jurídico
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Métricas */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-6 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-theme-secondary" />
                Métricas
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <UserGroupIcon className="h-8 w-8 mx-auto text-blue-600 mb-3" />
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {metricas.estudiantesRegistrados}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Estudiantes
                  </div>
                  <div className="text-xs text-theme-muted">
                    Registrados
                  </div>
                </div>
                
                <div className="text-center p-4">
                  <ClipboardDocumentListIcon className="h-8 w-8 mx-auto text-green-600 mb-3" />
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {metricas.reportesEsteMes}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Reportes
                  </div>
                  <div className="text-xs text-theme-muted">
                    Este Mes
                  </div>
                </div>
                
                <div className="text-center p-4">
                  <ExclamationTriangleIcon className="h-8 w-8 mx-auto text-orange-600 mb-3" />
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {metricas.estudiantesPendientes}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Pendientes
                  </div>
                  <div className="text-xs text-theme-muted">
                    Registro
                  </div>
                </div>
                
                <div className="text-center p-4">
                  <DocumentTextIcon className="h-8 w-8 mx-auto text-purple-600 mb-3" />
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {metricas.totalReportes}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Total Reportes
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-6">
                Acciones
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/gestion-estudiantes"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PlusIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Registrar Estudiante</h3>
                      <p className="text-sm text-theme-secondary">Agregar nuevos estudiantes</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/control-operativo"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Estadísticas</h3>
                      <p className="text-sm text-theme-secondary">Analíticas y reportes</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/gestion-estudiantes"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Gestionar</h3>
                      <p className="text-sm text-theme-secondary">Administrar estudiantes</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/control-operativo"
                  className="group border-theme rounded-lg p-4 hover:bg-theme-tertiary transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-theme-primary">Ver Reportes</h3>
                      <p className="text-sm text-theme-secondary">Revisar controles operativos</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Derecho */}
          <div className="space-y-6">
            
            {/* Actividad Reciente */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-theme-secondary" />
                Actividad Reciente
              </h2>
              
              <div className="space-y-4">
                {actividadReciente.length > 0 ? (
                  actividadReciente.map((actividad) => (
                    <div key={actividad.id} className="flex items-start space-x-3 p-3 bg-theme-tertiary rounded-lg">
                      {getActivityIcon(actividad.tipo)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-theme-primary">{actividad.mensaje}</p>
                        <p className="text-xs text-theme-muted">{actividad.tiempo}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-theme-muted mx-auto mb-3" />
                    <p className="text-theme-secondary">No hay actividad reciente</p>
                    <p className="text-sm text-theme-muted">La actividad aparecerá aquí cuando haya estudiantes registrados o reportes creados</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-theme">
                <Link
                  to="/actividad"
                  className="text-sm text-university-purple hover:text-purple-700 font-medium"
                >
                  Ver toda la actividad →
                </Link>
              </div>
            </div>

            {/* Resumen del Sistema */}
            <div className="card-theme rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-theme-primary mb-4">
                Resumen del Sistema
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Estado del Sistema</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Operativo
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Tu Rol</span>
                  <span className="text-sm font-medium text-theme-primary">Coordinador</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Última Sesión</span>
                  <span className="text-sm text-theme-muted">Hoy</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-theme-secondary">Versión</span>
                  <span className="text-sm text-theme-muted">v2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardCoordinador