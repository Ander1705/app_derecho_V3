import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { 
  UserIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()

  const getRoleIcon = (role) => {
    switch (role) {
      case 'coordinador':
        return <AcademicCapIcon className="w-8 h-8" />
      case 'estudiante':
        return <BookOpenIcon className="w-8 h-8" />
      default:
        return <UserIcon className="w-8 h-8" />
    }
  }

  const getRoleTitle = (role) => {
    switch (role) {
      case 'coordinador':
        return 'Coordinador'
      case 'estudiante':
        return 'Estudiante'
      default:
        return 'Usuario'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'coordinador':
        return 'from-purple-600 to-blue-600'
      case 'estudiante':
        return 'from-green-600 to-blue-600'
      default:
        return 'from-gray-600 to-blue-600'
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 bg-gradient-to-r ${getRoleColor(user?.role)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {getRoleIcon(user?.role)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido, {user?.nombre}!
              </h1>
              <p className="text-gray-600 text-lg">
                {getRoleTitle(user?.role)} - Sistema Jurídico UCMC
              </p>
              {user?.role === 'estudiante' && (
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600 text-sm">
                    <strong>Programa:</strong> {user?.programa_academico}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Semestre:</strong> {user?.semestre}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Código de estudiante:</strong> {user?.codigo_estudiante}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Opciones rápidas del coordinador */}
        {user?.role === 'coordinador' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="w-6 h-6 mr-2 text-purple-600" />
              Accesos Rápidos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/gestion-estudiantes"
                className="group bg-purple-50 border border-purple-200 rounded-xl p-4 hover:bg-purple-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Gestión de Estudiantes</h4>
                    <p className="text-gray-600 text-sm">Pre-registrar estudiantes</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/control-operativo"
                className="group bg-orange-50 border border-orange-200 rounded-xl p-4 hover:bg-orange-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Control Operativo</h4>
                    <p className="text-gray-600 text-sm">Seguimiento académico</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/solicitudes-conciliacion"
                className="group bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Solicitudes</h4>
                    <p className="text-gray-600 text-sm">Conciliación y mediación</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-900 ml-2">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Rol:</span>
              <span className="text-gray-900 ml-2">{getRoleTitle(user?.role)}</span>
            </div>
            {user?.telefono && (
              <div>
                <span className="text-gray-500">Teléfono:</span>
                <span className="text-gray-900 ml-2">{user?.telefono}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Fecha de registro:</span>
              <span className="text-gray-900 ml-2">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-green-800 font-medium mb-2">✅ Sistema Implementado Exitosamente</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Roles actualizados: Coordinador y Estudiante</li>
              <li>• Validación de estudiantes implementada</li>
              <li>• Registro con validación de base de datos</li>
              <li>• Autenticación JWT funcional</li>
              <li>• Email de recuperación de contraseña</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard