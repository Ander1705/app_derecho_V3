import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  ScaleIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

// Navegación específica por rol
const getNavigationByRole = (role) => {
  if (role === 'coordinador') {
    return [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Gestión de Estudiantes', href: '/gestion-estudiantes', icon: UserGroupIcon },
      { name: 'Control Operativo', href: '/control-operativo', icon: ClipboardDocumentListIcon },
      { name: 'Solicitudes de Conciliación', href: '/solicitudes-conciliacion', icon: DocumentTextIcon },
    ]
  } else if (role === 'estudiante') {
    return [
      { name: 'Mi Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Control Operativo', href: '/control-operativo-estudiante', icon: ClipboardDocumentListIcon },
      { name: 'Mi Perfil', href: '/perfil-estudiante', icon: AcademicCapIcon },
    ]
  } else {
    // Rol por defecto
    return [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ]
  }
}

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth()
  const { isDark } = useTheme()
  const navigation = getNavigationByRole(user?.role)

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${
      isDark 
        ? 'bg-theme-primary border-r border-theme' 
        : 'bg-gradient-to-b from-purple-800 to-purple-900 text-white'
    }`}>
      {/* Botón cerrar para mobile */}
      {onClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              isDark
                ? 'text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary'
                : 'text-purple-200 hover:text-white hover:bg-purple-700'
            }`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Información del usuario */}
      <div className={`px-6 py-4 ${
        isDark 
          ? 'border-b border-theme bg-theme-tertiary' 
          : 'border-b border-purple-700 bg-purple-800 bg-opacity-50'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-university-gold flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.nombre?.charAt(0)}{user?.apellidos?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              isDark ? 'text-theme-primary' : 'text-white'
            }`}>
              {user?.nombre} {user?.apellidos}
            </p>
            <p className={`text-xs capitalize ${
              isDark ? 'text-theme-secondary' : 'text-purple-200'
            }`}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-university-gold text-white shadow-lg'
                  : isDark
                    ? 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary'
                    : 'text-purple-100 hover:bg-purple-700 hover:text-white'
              }`
            }
          >
            <item.icon
              className="flex-shrink-0 h-5 w-5 mr-3"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Cerrar Sesión */}
      <div className="px-4 py-2">
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-600 hover:text-white ${
            isDark ? 'text-theme-secondary' : 'text-purple-100'
          }`}
        >
          <ArrowRightOnRectangleIcon
            className="flex-shrink-0 h-5 w-5 mr-3"
            aria-hidden="true"
          />
          Cerrar Sesión
        </button>
      </div>

      {/* Sección inferior */}
      <div className={`px-6 py-4 ${
        isDark ? 'border-t border-theme' : 'border-t border-purple-700'
      }`}>
        <div className={`rounded-lg p-3 ${
          isDark ? 'bg-theme-tertiary' : 'bg-purple-800 bg-opacity-50'
        }`}>
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 text-university-gold" />
            <div className="ml-2">
              <p className={`text-xs font-medium ${
                isDark ? 'text-theme-primary' : 'text-white'
              }`}>Universidad</p>
              <p className={`text-xs ${
                isDark ? 'text-theme-secondary' : 'text-purple-200'
              }`}>Facultad de Derecho</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <p className={`text-xs ${
            isDark ? 'text-theme-muted' : 'text-purple-300'
          }`}>
            Sistema de Estudiantes v2.0
          </p>
          <p className={`text-xs ${
            isDark ? 'text-theme-muted' : 'text-purple-400'
          }`}>
            © 2025 UCMC Derecho
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar