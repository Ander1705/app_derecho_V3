import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  // Cerrar menús cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="bg-theme-primary shadow-theme border-b border-theme sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Lado izquierdo */}
        <div className="flex items-center">
          {/* Botón menú mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo y nombre de la universidad */}
          <div className="flex items-center ml-4 lg:ml-0">
            <div className="flex-shrink-0">
              <img 
                src="/escudo.svg" 
                alt="Escudo Universidad Colegio Mayor de Cundinamarca" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-theme-primary">
                Universidad Colegio Mayor de Cundinamarca
              </h1>
              <p className="text-sm text-theme-secondary hidden sm:block">
                Facultad de Derecho - Sistema de Estudiantes
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center space-x-4">
          {/* Buscador y Toggle de Tema */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Buscar casos, clientes..."
                className="w-64 pl-10 pr-4 py-2 border border-theme rounded-lg text-sm bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors duration-300"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Toggle de Tema Elegante */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-lg bg-theme-secondary border border-theme hover:bg-theme-tertiary transition-all duration-300 group"
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              <div className="relative w-5 h-5">
                <SunIcon 
                  className={`absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-300 transform ${
                    isDark ? 'rotate-90 scale-100 opacity-100' : 'rotate-0 scale-75 opacity-0'
                  }`}
                />
                <MoonIcon 
                  className={`absolute inset-0 h-5 w-5 text-blue-600 transition-all duration-300 transform ${
                    !isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Notificaciones */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-full"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Dropdown de notificaciones */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Notificaciones</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">Nuevo cliente registrado</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 5 minutos</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">Vencimiento de término procesal</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">Documento pendiente de revisión</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200">
                    <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex items-center text-sm">
            <span className="hidden md:block text-theme-primary mr-3">
              {user?.nombre} {user?.apellidos}
            </span>
            <span className="hidden md:block text-xs text-purple-800 mr-3 px-2 py-1 bg-purple-100 rounded-full">
              {user?.role}
            </span>
          </div>

          {/* Menú de usuario */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-gray-500" />
            </button>

            {/* Dropdown del usuario */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-theme-primary rounded-md shadow-theme ring-1 ring-black ring-opacity-5 z-50 border border-theme transition-all duration-300">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-theme">
                    <p className="text-sm font-medium text-theme-primary">
                      {user?.nombre} {user?.apellidos}
                    </p>
                    <p className="text-sm text-theme-secondary">{user?.email}</p>
                    <p className="text-xs text-theme-muted mt-1 capitalize">
                      Rol: {user?.role}
                    </p>
                  </div>
                  
                  <Link 
                    to="/perfil"
                    className="flex items-center w-full px-4 py-2 text-sm text-theme-primary hover:bg-theme-tertiary transition-colors duration-200"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    Mi Perfil
                  </Link>
                  
                  <div className="border-t border-theme">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header