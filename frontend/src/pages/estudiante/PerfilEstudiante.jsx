import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import InfoModal from '../../components/ui/InfoModal'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  KeyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const PerfilEstudiante = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({})
  const [estadisticas, setEstadisticas] = useState({
    controles_creados: 0,
    ultimo_acceso: null,
    fecha_registro: null
  })

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    codigo_estudiante: user?.codigo_estudiante || ''
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get('/api/estudiante/estadisticas')
      setEstadisticas(response.data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!formData.nombre || !formData.apellidos || !formData.email) {
      setInfoModalData({
        title: "Campos Obligatorios",
        message: "Por favor completa todos los campos obligatorios.",
        details: ["Nombre", "Apellidos", "Email"],
        type: "error"
      })
      setShowInfoModal(true)
      return
    }

    try {
      setLoading(true)
      const response = await axios.put('/api/perfil', formData)
      
      // Actualizar contexto de usuario
      updateUser(response.data)
      
      setInfoModalData({
        title: "Perfil Actualizado",
        message: "Tu información personal ha sido actualizada correctamente.",
        details: ["Los cambios se han guardado exitosamente"],
        type: "success"
      })
      setShowInfoModal(true)
      setEditMode(false)
    } catch (error) {
      setInfoModalData({
        title: "Error",
        message: "No se pudo actualizar el perfil.",
        details: [error.response?.data?.detail || "Error del servidor"],
        type: "error"
      })
      setShowInfoModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setInfoModalData({
        title: "Campos Obligatorios",
        message: "Por favor completa todos los campos de contraseña.",
        details: [],
        type: "error"
      })
      setShowInfoModal(true)
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setInfoModalData({
        title: "Error de Confirmación",
        message: "Las contraseñas nuevas no coinciden.",
        details: [],
        type: "error"
      })
      setShowInfoModal(true)
      return
    }

    if (passwordData.new_password.length < 6) {
      setInfoModalData({
        title: "Contraseña Débil",
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
        details: [],
        type: "error"
      })
      setShowInfoModal(true)
      return
    }

    try {
      setLoading(true)
      await axios.put('/api/cambiar-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setInfoModalData({
        title: "Contraseña Cambiada",
        message: "Tu contraseña ha sido actualizada correctamente.",
        details: ["Por seguridad, conserva tu nueva contraseña en un lugar seguro"],
        type: "success"
      })
      setShowInfoModal(true)
      setShowPasswordModal(false)
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      setInfoModalData({
        title: "Error",
        message: "No se pudo cambiar la contraseña.",
        details: [error.response?.data?.detail || "Verifica tu contraseña actual"],
        type: "error"
      })
      setShowInfoModal(true)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setFormData({
      nombre: user?.nombre || '',
      apellidos: user?.apellidos || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      codigo_estudiante: user?.codigo_estudiante || ''
    })
    setEditMode(false)
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-university-purple flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {user?.nombre?.charAt(0)}{user?.apellidos?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.nombre} {user?.apellidos}
                </h1>
                <p className="text-gray-600">Estudiante de Derecho</p>
                <p className="text-sm text-university-purple font-medium">
                  {user?.codigo_estudiante && `Código: ${user.codigo_estudiante}`}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {editMode ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-university-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-4 py-2 bg-university-purple text-white rounded-lg hover:bg-purple-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode 
                        ? 'focus:ring-2 focus:ring-university-purple focus:border-transparent' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode 
                        ? 'focus:ring-2 focus:ring-university-purple focus:border-transparent' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode 
                        ? 'focus:ring-2 focus:ring-university-purple focus:border-transparent' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="h-4 w-4 inline mr-1" />
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      editMode 
                        ? 'focus:ring-2 focus:ring-university-purple focus:border-transparent' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                    Código de Estudiante
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_estudiante}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este campo no se puede modificar</p>
                </div>
              </div>

              {/* Seguridad */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h3>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                Estadísticas
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Controles Operativos</span>
                  <span className="font-semibold text-university-purple">{estadisticas.controles_creados}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                </div>

                {estadisticas.ultimo_acceso && (
                  <div className="py-2">
                    <span className="text-sm text-gray-600 block">Último acceso</span>
                    <span className="text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 inline mr-1" />
                      {new Date(estadisticas.ultimo_acceso).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {estadisticas.fecha_registro && (
                  <div className="py-2">
                    <span className="text-sm text-gray-600 block">Miembro desde</span>
                    <span className="text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 inline mr-1" />
                      {new Date(estadisticas.fecha_registro).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sistema</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Rol:</strong> {user?.role}</p>
                <p><strong>Universidad:</strong> Colegio Mayor de Cundinamarca</p>
                <p><strong>Facultad:</strong> Derecho</p>
                <p><strong>Sistema:</strong> Control Operativo v2.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-purple"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 bg-university-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        details={infoModalData.details || []}
        type={infoModalData.type}
      />
    </div>
  )
}

export default PerfilEstudiante