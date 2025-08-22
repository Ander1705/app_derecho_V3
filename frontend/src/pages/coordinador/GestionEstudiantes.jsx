import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmModal from '../../components/ui/ConfirmModal'
import InfoModal from '../../components/ui/InfoModal'
import { 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

const GestionEstudiantes = () => {
  const { eliminarEstudiante } = useAuth()
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('crear')
  const [estudianteEditando, setEstudianteEditando] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [estudianteAEliminar, setEstudianteAEliminar] = useState(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({})
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email_institucional: '',
    documento_numero: '',
    semestre: 1
  })

  useEffect(() => {
    cargarEstudiantes()
  }, [])

  const cargarEstudiantes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/auth/coordinador/estudiantes')
      setEstudiantes(response.data)
      setError('')
    } catch (error) {
      console.error('Error cargando estudiantes:', error)
      setError('Error al cargar estudiantes: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      email_institucional: '',
      documento_numero: '',
      semestre: 1
    })
  }

  const abrirModal = (modo, estudiante = null) => {
    setModalMode(modo)
    setEstudianteEditando(estudiante)
    
    if (modo === 'editar' && estudiante) {
      setFormData({
        nombre: estudiante.nombre,
        apellidos: estudiante.apellidos,
        email_institucional: estudiante.email_institucional,
        documento_numero: estudiante.documento_numero,
        semestre: estudiante.semestre
      })
    } else {
      limpiarFormulario()
    }
    
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEstudianteEditando(null)
    limpiarFormulario()
    setError('')
    setSuccess('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      let response
      if (modalMode === 'crear') {
        response = await axios.post('/api/auth/coordinador/registrar-estudiante', formData)
        
        // Mostrar modal informativo para creación
        setInfoModalData({
          title: "Estudiante Registrado Exitosamente",
          message: "El estudiante ha sido registrado en el sistema y puede proceder con su auto-registro.",
          details: [
            `Nombre: ${formData.nombre} ${formData.apellidos}`,
            `Email: ${formData.email_institucional}`,
            `Documento: ${formData.documento_numero}`,
            `Semestre: ${formData.semestre}`,
            `Código de estudiante: ${response.data.codigo_estudiante || 'Generado automáticamente'}`
          ],
          type: "success",
          showCopyButton: true,
          copyData: response.data.codigo_estudiante || ''
        })
        setShowInfoModal(true)
        
      } else {
        response = await axios.put(`/api/auth/coordinador/estudiante/${estudianteEditando.id}`, formData)
        
        // Mostrar modal informativo para actualización
        setInfoModalData({
          title: "Estudiante Actualizado Exitosamente",
          message: "Los datos del estudiante han sido actualizados correctamente.",
          details: [
            `Nombre: ${formData.nombre} ${formData.apellidos}`,
            `Email: ${formData.email_institucional}`,
            `Documento: ${formData.documento_numero}`,
            `Semestre: ${formData.semestre}`
          ],
          type: "success"
        })
        setShowInfoModal(true)
      }
      
      await cargarEstudiantes()
      cerrarModal()
      
    } catch (error) {
      console.error('Error:', error)
      setError('Error: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const abrirModalEliminar = (estudiante) => {
    setEstudianteAEliminar(estudiante)
    setShowConfirmModal(true)
  }

  const handleEliminar = async () => {
    if (!estudianteAEliminar) return

    try {
      const result = await eliminarEstudiante(estudianteAEliminar.id)
      if (result.success) {
        setSuccess('✅ ' + (result.data.mensaje || result.data.detail || 'Estudiante eliminado correctamente'))
        await cargarEstudiantes()
        setTimeout(() => setSuccess(''), 4000)
      } else {
        setError(result.error)
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error eliminando estudiante: ' + error.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setEstudianteAEliminar(null)
      setShowConfirmModal(false)
    }
  }

  const estudiantesFiltrados = estudiantes.filter(estudiante =>
    estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.codigo_estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.email_institucional.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.documento_numero.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-university-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estudiantes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-university-blue rounded-xl flex items-center justify-center shadow-lg">
                <UserGroupIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
                <p className="text-gray-600 mt-1">Administrar estudiantes válidos del sistema</p>
              </div>
            </div>
            <button
              onClick={() => abrirModal('crear')}
              className="flex items-center space-x-2 bg-university-blue text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-semibold">Registrar Estudiante</span>
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Búsqueda y estadísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Buscador */}
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código, documento o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-university-blue focus:border-transparent shadow-sm"
              />
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{estudiantes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Registrados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estudiantes.filter(e => e.estado === 'REGISTRADO' || e.estado === 'Registrado').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {estudiantesFiltrados.length === 0 && !searchTerm ? (
            <div className="p-12 text-center">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes registrados</h3>
              <p className="text-gray-500 mb-6">Comienza registrando tu primer estudiante para el sistema</p>
              <button
                onClick={() => abrirModal('crear')}
                className="inline-flex items-center space-x-2 bg-university-blue text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Registrar Primer Estudiante</span>
              </button>
            </div>
          ) : estudiantesFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No se encontraron estudiantes con ese criterio de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {estudiantesFiltrados.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {estudiante.nombre.charAt(0)}{estudiante.apellidos.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {estudiante.nombre} {estudiante.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">{estudiante.email_institucional}</div>
                            <div className="text-xs text-gray-400">Doc: {estudiante.documento_numero}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {estudiante.codigo_estudiante}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{estudiante.programa_academico}</span>
                          <span className="text-sm text-gray-500">• S{estudiante.semestre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(estudiante.estado === 'REGISTRADO' || estudiante.estado === 'Registrado') ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Registrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => abrirModal('editar', estudiante)}
                            className="p-2 text-gray-400 hover:text-university-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar estudiante"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirModalEliminar(estudiante)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar estudiante"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-university-blue rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'crear' ? 'Registrar Nuevo Estudiante' : 'Editar Estudiante'}
                </h2>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                  <p className="text-green-800">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    placeholder="Juan Carlos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    placeholder="Pérez López"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Institucional *
                  </label>
                  <input
                    type="email"
                    name="email_institucional"
                    value={formData.email_institucional}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    placeholder="estudiante@ucmc.edu.co"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento *
                  </label>
                  <input
                    type="text"
                    name="documento_numero"
                    value={formData.documento_numero}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    placeholder="1234567890"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semestre *
                  </label>
                  <select
                    name="semestre"
                    value={formData.semestre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    required
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Semestre {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Información importante:</p>
                    <ul className="text-blue-700 text-sm mt-1 space-y-1">
                      <li>• El programa académico es fijo: Derecho</li>
                      <li>• El código estudiantil se genera automáticamente</li>
                      <li>• El código será necesario para que el estudiante se registre</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-university-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    modalMode === 'crear' ? 'Registrar Estudiante' : 'Actualizar Estudiante'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleEliminar}
        title="Confirmar eliminación"
        message={
          estudianteAEliminar
            ? `¿Realmente quiere eliminar al estudiante ${estudianteAEliminar.nombre} ${estudianteAEliminar.apellidos}?

Esto eliminará:
• El registro del estudiante del sistema
• Su cuenta de usuario si ya se registró

Código: ${estudianteAEliminar.codigo_estudiante}`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal informativo */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoModalData.title}
        message={infoModalData.message}
        details={infoModalData.details || []}
        type={infoModalData.type}
        showCopyButton={infoModalData.showCopyButton}
        copyData={infoModalData.copyData}
      />
    </div>
  )
}

export default GestionEstudiantes