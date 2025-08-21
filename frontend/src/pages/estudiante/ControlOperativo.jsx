import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import InfoModal from '../../components/ui/InfoModal'

const ControlOperativoEstudiante = () => {
  const { user } = useAuth()
  const [controles, setControles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [documentos, setDocumentos] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({})
  const inicialNombreEstudiante = (user?.nombre && user?.apellidos) ? `${user.nombre} ${user.apellidos}` : ''

  const [formData, setFormData] = useState({
    ciudad: 'Bogotá D.C',
    fecha_dia: new Date().getDate(),
    fecha_mes: new Date().getMonth() + 1,
    fecha_ano: new Date().getFullYear(),
    nombre_docente_responsable: '',
    nombre_estudiante: inicialNombreEstudiante,
    area_consulta: '',
    remitido_por: '',
    correo_electronico: '',
    nombre_consultante: '',
    edad: '',
    fecha_nacimiento_dia: '',
    fecha_nacimiento_mes: '',
    fecha_nacimiento_ano: '',
    lugar_nacimiento: '',
    sexo: '',
    tipo_documento: '',
    numero_documento: '',
    lugar_expedicion: '',
    direccion: '',
    barrio: '',
    estrato: '',
    numero_telefonico: '',
    numero_celular: '',
    estado_civil: '',
    escolaridad: '',
    profesion_oficio: '',
    descripcion_caso: '',
    concepto_estudiante: '',
    concepto_asesor: '',
  })

  useEffect(() => {
    cargarControles()
  }, [])

  useEffect(() => {
    if (user?.nombre && user?.apellidos) {
      const nombreCompleto = `${user.nombre} ${user.apellidos}`
      setFormData(prev => ({
        ...prev,
        nombre_estudiante: nombreCompleto
      }))
    }
  }, [user])

  const cargarControles = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/control-operativo/')
      setControles(response.data)
    } catch (error) {
      console.error('Error cargando controles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      setLoading(true)
      
      const camposObligatorios = [
        'ciudad', 
        'nombre_estudiante', 
        'nombre_consultante', 
        'numero_documento'
      ]
      const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = formData[campo]
        if (typeof valor === 'string') {
          return !valor.trim()
        }
        return !valor
      })
      
      if (camposFaltantes.length > 0) {
        const camposTexto = camposFaltantes.map(campo => {
          switch(campo) {
            case 'ciudad': return 'Ciudad'
            case 'nombre_estudiante': return 'Nombre del estudiante responsable'
            case 'nombre_consultante': return 'Nombre del consultante'
            case 'numero_documento': return 'Número de documento del consultante'
            default: return campo
          }
        })
        setInfoModalData({
          title: "Campos Obligatorios Faltantes",
          message: "Por favor completa los siguientes campos obligatorios antes de guardar:",
          details: camposTexto,
          type: "error"
        })
        setShowInfoModal(true)
        setLoading(false)
        return
      }
      
      const dataToSend = {
        ...formData,
        fecha_dia: formData.fecha_dia ? parseInt(formData.fecha_dia) : null,
        fecha_mes: formData.fecha_mes ? parseInt(formData.fecha_mes) : null,
        fecha_ano: formData.fecha_ano ? parseInt(formData.fecha_ano) : new Date().getFullYear(),
        fecha_nacimiento_dia: formData.fecha_nacimiento_dia ? parseInt(formData.fecha_nacimiento_dia) : null,
        fecha_nacimiento_mes: formData.fecha_nacimiento_mes ? parseInt(formData.fecha_nacimiento_mes) : null,
        fecha_nacimiento_ano: formData.fecha_nacimiento_ano ? parseInt(formData.fecha_nacimiento_ano) : null,
        edad: formData.edad ? parseInt(formData.edad) : null,
        estrato: formData.estrato ? parseInt(formData.estrato) : null
      }
      
      const response = await axios.post('/api/control-operativo/', dataToSend)
      console.log('✅ Control operativo guardado con ID:', response.data.id)
      
      setInfoModalData({
        title: "Control Operativo Guardado Exitosamente",
        message: "El control operativo de consulta jurídica ha sido registrado correctamente en el sistema.",
        details: [
          `ID del control: ${response.data.id || 'Generado automáticamente'}`,
          `Ciudad: ${dataToSend.ciudad}`,
          `Fecha: ${dataToSend.fecha_dia}/${dataToSend.fecha_mes}/${dataToSend.fecha_ano}`,
          `Consultante: ${dataToSend.nombre_consultante || 'No especificado'}`,
          `Área de consulta: ${dataToSend.area_consulta || 'No especificado'}`,
          `Fecha de registro: ${new Date().toLocaleString()}`
        ],
        type: "success"
      })
      setShowInfoModal(true)
      
      await cargarControles()
      cancelarFormulario()
    } catch (error) {
      console.error('❌ Error guardando control operativo:', error.response?.data || error.message)
      
      let errorMessage = 'Error guardando el control operativo'
      let errorDetails = []
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = 'Errores de validación encontrados'
          errorDetails = error.response.data.detail.map(err => {
            const field = err.loc?.join('.') || 'Campo desconocido'
            const message = err.msg || 'Error de validación'
            return `${field}: ${message}`
          })
        } else {
          errorMessage = error.response.data.detail
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión con el servidor'
        errorDetails = ['Verifica tu conexión a internet', 'Asegúrate de que el servidor esté funcionando']
      } else {
        errorMessage = 'Error inesperado'
        errorDetails = [error.message || 'Error desconocido']
      }
      
      setInfoModalData({
        title: "Error al Guardar Control Operativo",
        message: errorMessage,
        details: errorDetails,
        type: "error"
      })
      setShowInfoModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePDF = async (id) => {
    try {
      const response = await axios.get(`/api/control-operativo/${id}/pdf`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `control_operativo_${id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error generando el PDF')
    }
  }

  const resetFormData = () => {
    setFormData({
      ciudad: 'Bogotá D.C',
      fecha_dia: new Date().getDate(),
      fecha_mes: new Date().getMonth() + 1,
      fecha_ano: new Date().getFullYear(),
      nombre_docente_responsable: '',
      nombre_estudiante: (user?.nombre && user?.apellidos) ? `${user.nombre} ${user.apellidos}` : '',
      area_consulta: '',
      remitido_por: '',
      correo_electronico: '',
      nombre_consultante: '',
      edad: '',
      fecha_nacimiento_dia: '',
      fecha_nacimiento_mes: '',
      fecha_nacimiento_ano: '',
      lugar_nacimiento: '',
      sexo: '',
      tipo_documento: '',
      numero_documento: '',
      lugar_expedicion: '',
      direccion: '',
      barrio: '',
      estrato: '',
      numero_telefonico: '',
      numero_celular: '',
      estado_civil: '',
      escolaridad: '',
      profesion_oficio: '',
      descripcion_caso: '',
      concepto_estudiante: '',
      concepto_asesor: '',
    })
    setDocumentos([])
  }

  const cancelarFormulario = () => {
    resetFormData()
    setShowForm(false)
    setEditingId(null)
  }

  const cargarDocumentos = async (controlId) => {
    try {
      const response = await axios.get(`/api/control-operativo/${controlId}/uploads`)
      setDocumentos(response.data)
    } catch (error) {
      console.error('Error cargando documentos:', error)
    }
  }

  const handleFileUpload = async (event) => {
    if (!editingId) {
      alert('Primero debes guardar el control operativo para poder subir documentos')
      return
    }

    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingFile(true)
      await axios.post(`/api/control-operativo/${editingId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      await cargarDocumentos(editingId)
      event.target.value = ''
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      alert('Error subiendo el archivo: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteDocument = async (documentoId) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return

    try {
      await axios.delete(`/api/control-operativo/${editingId}/upload/${documentoId}`)
      await cargarDocumentos(editingId)
    } catch (error) {
      console.error('Error eliminando documento:', error)
      alert('Error eliminando el documento')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (showForm) {
    return (
      <div className="min-h-full bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex justify-center min-h-full">
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 lg:p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-university-purple">
                  {editingId ? 'Editar' : 'Nuevo'} Control Operativo
                </h1>
                <button
                  onClick={cancelarFormulario}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-university-purple mb-4">
                    I. DATOS DEL USUARIO
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de diligenciamiento
                      </label>
                      <input
                        type="text"
                        value={`${formData.fecha_dia}/${formData.fecha_mes}/${formData.fecha_ano}`}
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">Se completa automáticamente</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Docente Responsable
                      </label>
                      <input
                        type="text"
                        name="nombre_docente_responsable"
                        value={formData.nombre_docente_responsable}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Estudiante
                      </label>
                      <input
                        type="text"
                        name="nombre_estudiante"
                        value={formData.nombre_estudiante}
                        onChange={handleInputChange}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        title="Este campo se completa automáticamente con tu nombre"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Área de Consulta
                      </label>
                      <select
                        name="area_consulta"
                        value={formData.area_consulta}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      >
                        <option value="">Seleccionar área</option>
                        <option value="Civil">Civil</option>
                        <option value="Penal">Penal</option>
                        <option value="Laboral">Laboral</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Familia">Familia</option>
                        <option value="Constitucional">Constitucional</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-university-purple mb-4">
                    II. INFORMACIÓN GENERAL DEL CONSULTANTE
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remitido por
                      </label>
                      <input
                        type="text"
                        name="remitido_por"
                        value={formData.remitido_por}
                        onChange={handleInputChange}
                        placeholder="Ej: Consultorio Jurídico, Defensoría, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        name="correo_electronico"
                        value={formData.correo_electronico}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del consultante *
                      </label>
                      <input
                        type="text"
                        name="nombre_consultante"
                        value={formData.nombre_consultante}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edad
                      </label>
                      <input
                        type="number"
                        name="edad"
                        value={formData.edad}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Día nac.
                      </label>
                      <input
                        type="number"
                        name="fecha_nacimiento_dia"
                        value={formData.fecha_nacimiento_dia}
                        onChange={handleInputChange}
                        min="1"
                        max="31"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mes nac.
                      </label>
                      <input
                        type="number"
                        name="fecha_nacimiento_mes"
                        value={formData.fecha_nacimiento_mes}
                        onChange={handleInputChange}
                        min="1"
                        max="12"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Año nac.
                      </label>
                      <input
                        type="number"
                        name="fecha_nacimiento_ano"
                        value={formData.fecha_nacimiento_ano}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lugar de nacimiento
                      </label>
                      <input
                        type="text"
                        name="lugar_nacimiento"
                        value={formData.lugar_nacimiento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sexo
                      </label>
                      <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de documento
                      </label>
                      <select
                        name="tipo_documento"
                        value={formData.tipo_documento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="T.I.">T.I.</option>
                        <option value="C.C.">C.C.</option>
                        <option value="NUIP">NUIP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de documento *
                      </label>
                      <input
                        type="text"
                        name="numero_documento"
                        value={formData.numero_documento}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lugar de expedición
                      </label>
                      <input
                        type="text"
                        name="lugar_expedicion"
                        value={formData.lugar_expedicion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Barrio
                      </label>
                      <input
                        type="text"
                        name="barrio"
                        value={formData.barrio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estrato
                      </label>
                      <input
                        type="number"
                        name="estrato"
                        value={formData.estrato}
                        onChange={handleInputChange}
                        min="1"
                        max="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número telefónico
                      </label>
                      <input
                        type="text"
                        name="numero_telefonico"
                        value={formData.numero_telefonico}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número celular
                      </label>
                      <input
                        type="text"
                        name="numero_celular"
                        value={formData.numero_celular}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado civil
                      </label>
                      <select
                        name="estado_civil"
                        value={formData.estado_civil}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Soltero(a)">Soltero(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viudo(a)">Viudo(a)</option>
                        <option value="Unión libre">Unión libre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Escolaridad
                      </label>
                      <input
                        type="text"
                        name="escolaridad"
                        value={formData.escolaridad}
                        onChange={handleInputChange}
                        placeholder="Ej: Bachiller, Técnico, Universitario"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profesión u oficio
                      </label>
                      <input
                        type="text"
                        name="profesion_oficio"
                        value={formData.profesion_oficio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-university-purple mb-4">
                    III. BREVE DESCRIPCIÓN DEL CASO
                  </h2>
                  
                  <div>
                    <textarea
                      name="descripcion_caso"
                      value={formData.descripcion_caso}
                      onChange={handleInputChange}
                      rows={8}
                      placeholder="Describa brevemente el caso..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-university-purple mb-4">
                    IV. CONCEPTO DEL ESTUDIANTE
                  </h2>
                  
                  <div>
                    <textarea
                      name="concepto_estudiante"
                      value={formData.concepto_estudiante}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Escriba su análisis jurídico del caso..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-university-purple mb-4">
                    V. CONCEPTO DEL ASESOR JURÍDICO
                  </h2>
                  
                  <div>
                    <textarea
                      name="concepto_asesor"
                      value={formData.concepto_asesor}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Espacio reservado para el concepto del asesor jurídico..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={cancelarFormulario}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-university-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-university-purple">
              Mis Controles Operativos
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-university-purple hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nuevo Control Operativo</span>
            </button>
          </div>

          {controles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Mis Reportes</div>
                <div className="text-2xl font-semibold text-university-purple mt-1">{controles.length}</div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Este Mes</div>
                <div className="text-2xl font-semibold text-university-purple mt-1">
                  {controles.filter(c => {
                    const createdDate = new Date(c.created_at)
                    const now = new Date()
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear()
                  }).length}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Activos</div>
                <div className="text-2xl font-semibold text-university-purple mt-1">{controles.filter(c => c.activo).length}</div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Último ID</div>
                <div className="text-2xl font-semibold text-university-purple mt-1">
                  {controles.length > 0 ? Math.max(...controles.map(c => c.id)) : 0}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
            </div>
          )}

          {!loading && controles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay controles operativos creados</p>
              <p className="text-gray-500 mt-2">Haz clic en "Nuevo Control Operativo" para comenzar</p>
            </div>
          )}

          {controles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-university-purple">Mis Controles Operativos</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Consulta y gestiona tus controles operativos
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consultante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Área
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {controles.map((control) => (
                      <tr key={control.id} className="border-b hover:bg-purple-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          #{control.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {control.fecha_dia && control.fecha_mes && control.fecha_ano
                            ? `${control.fecha_dia}/${control.fecha_mes}/${control.fecha_ano}`
                            : 'No definida'
                          }
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {control.nombre_consultante || 'Sin nombre'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {control.area_consulta || 'Sin área'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            control.is_finalizado 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {control.is_finalizado ? 'Finalizado' : 'En proceso'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => handleGeneratePDF(control.id)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-university-blue hover:bg-blue-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                              title="Generar PDF"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Descargar PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
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

export default ControlOperativoEstudiante