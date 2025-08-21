import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { 
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  BellIcon,
  ScaleIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const DashboardEstudiante = () => {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpenIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido, {user?.nombre}!</h1>
                <p className="text-gray-600 mt-1">Portal de Estudiante - {user?.programa_academico}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Estudiante */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Código Estudiantil</p>
                <p className="text-lg font-bold text-gray-900 font-mono">{user?.codigo_estudiante}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Semestre</p>
                <p className="text-lg font-bold text-gray-900">{user?.semestre}°</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ScaleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Casos Activos</p>
                <p className="text-lg font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Consultas</p>
                <p className="text-lg font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-university-blue" />
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/perfil-estudiante"
              className="group bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 hover:from-green-100 hover:to-blue-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-medium">Mi Perfil</h4>
                  <p className="text-gray-600 text-sm">Ver información personal</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/mis-casos"
              className="group bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <ScaleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-medium">Mis Casos</h4>
                  <p className="text-gray-600 text-sm">Casos asignados</p>
                </div>
              </div>
            </Link>

            <Link
              to="/consultas"
              className="group bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 hover:from-orange-100 hover:to-red-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-medium">Consultas Jurídicas</h4>
                  <p className="text-gray-600 text-sm">Solicitar asesoría</p>
                </div>
              </div>
            </Link>

            <Link
              to="/documentos-estudiante"
              className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-medium">Documentos</h4>
                  <p className="text-gray-600 text-sm">Mis documentos</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mi Información Académica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Nombre Completo:</span>
                  <span className="text-gray-900 ml-2 font-medium">{user?.nombre} {user?.apellidos}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Email Institucional:</span>
                  <span className="text-gray-900 ml-2">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Programa Académico:</span>
                  <span className="text-gray-900 ml-2">{user?.programa_academico}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Código de Estudiante:</span>
                  <span className="text-gray-900 ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{user?.codigo_estudiante}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Semestre Actual:</span>
                  <span className="text-gray-900 ml-2">{user?.semestre}° Semestre</span>
                </div>
                {user?.telefono && (
                  <div>
                    <span className="text-gray-500 text-sm">Teléfono:</span>
                    <span className="text-gray-900 ml-2">{user?.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-green-800 font-medium mb-2 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              ✅ Cuenta Activa y Configurada
            </h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Tu cuenta de estudiante está completamente configurada</li>
              <li>• Tienes acceso a todos los servicios del portal</li>
              <li>• Puedes realizar consultas jurídicas y gestionar tus casos</li>
              <li>• Para cualquier consulta, contacta al coordinador del programa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardEstudiante