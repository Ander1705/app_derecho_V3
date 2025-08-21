import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import ConfirmModal from '../../components/ui/ConfirmModal'
import InfoModal from '../../components/ui/InfoModal'

const ControlOperativo = () => {
  const { user } = useAuth()
  const [controles, setControles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [documentos, setDocumentos] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [controlToDelete, setControlToDelete] = useState(null)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [controlToReactivate, setControlToReactivate] = useState(null)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfInfo, setPdfInfo] = useState(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalData, setInfoModalData] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    // I. DATOS DEL USUARIO
    ciudad: 'Bogotá D.C',
    fecha_dia: new Date().getDate(),
    fecha_mes: new Date().getMonth() + 1,
    fecha_ano: new Date().getFullYear(),
    nombre_docente_responsable: '',
    nombre_estudiante: '',
    area_consulta: '',

    // II. INFORMACIÓN GENERAL DEL CONSULTANTE
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

    // III. BREVE DESCRIPCIÓN DEL CASO
    descripcion_caso: '',

    // IV. CONCEPTO DEL ESTUDIANTE
    concepto_estudiante: '',

    // V. CONCEPTO DEL ASESOR JURÍDICO
    concepto_asesor: '',
  })

  useEffect(() => {
    cargarControles()
  }, [])

  useEffect(() => {
    console.log('📊 Estado showForm cambió:', showForm)
  }, [showForm])

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
    console.log('🚀 handleSubmit ejecutado')
    console.log('📝 FormData actual:', formData)
    
    try {
      setLoading(true)
      console.log('⏳ Loading establecido a true')
      
      // Validar campos obligatorios según el modelo del backend
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
        console.log('❌ Campos faltantes:', camposFaltantes)
        setInfoModalData({
          title: "Campos Obligatorios Faltantes",
          message: "Por favor completa los siguientes campos obligatorios antes de guardar:",
          details: camposFaltantes.map(campo => {
            switch(campo) {
              case 'ciudad': return 'Ciudad'
              case 'nombre_estudiante': return 'Nombre del estudiante responsable'
              case 'nombre_consultante': return 'Nombre del consultante'
              case 'numero_documento': return 'Número de documento del consultante'
              default: return campo
            }
          }),
          type: "error",
          confirmText: "Entendido"
        })
        setShowInfoModal(true)
        setLoading(false)
        return
      }
      
      console.log('✅ Validación de campos básicos pasada')
      
      // Preparar datos para envío - convertir strings a números donde sea necesario
      const dataToSend = {
        ...formData,
        fecha_dia: formData.fecha_dia ? parseInt(formData.fecha_dia) : null,
        fecha_mes: formData.fecha_mes ? parseInt(formData.fecha_mes) : null,
        fecha_ano: formData.fecha_ano ? parseInt(formData.fecha_ano) : new Date().getFullYear(),
        fecha_nacimiento_dia: formData.fecha_nacimiento_dia ? parseInt(formData.fecha_nacimiento_dia) : null,
        fecha_nacimiento_mes: formData.fecha_nacimiento_mes ? parseInt(formData.fecha_nacimiento_mes) : null,
        fecha_nacimiento_ano: formData.fecha_nacimiento_ano ? parseInt(formData.fecha_nacimiento_ano) : null,
        edad: formData.edad ? parseInt(formData.edad) : null,
        estrato: formData.estrato ? parseInt(formData.estrato) : null,
        semestre: formData.semestre ? parseInt(formData.semestre) : null
      }
      
      console.log('📤 Enviando datos:', dataToSend)
      const response = await axios.post('/api/control-operativo/', dataToSend)
      
      // Mostrar modal de éxito
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
      console.error('Error guardando control:', error)
      
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
      
      // Mostrar modal de error
      setInfoModalData({
        title: "Error al Guardar Control Operativo",
        message: errorMessage,
        details: errorDetails,
        type: "error",
        confirmText: "Entendido"
      })
      setShowInfoModal(true)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (control) => {
    setControlToDelete(control)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!controlToDelete) return
    
    try {
      await axios.delete(`/api/control-operativo/${controlToDelete.id}`)
      await cargarControles()
    } catch (error) {
      console.error('Error eliminando control:', error)
      alert('Error eliminando el control operativo')
    } finally {
      setControlToDelete(null)
    }
  }

  const openReactivateModal = (control) => {
    setControlToReactivate(control)
    setShowReactivateModal(true)
  }

  const handleReactivate = async () => {
    if (!controlToReactivate) return
    
    try {
      await axios.post(`/api/control-operativo/${controlToReactivate.id}/reactivar`)
      await cargarControles()
      
      // Mostrar modal informativo
      setInfoModalData({
        title: "Control Operativo Reactivado",
        message: "El control operativo ha sido reactivado exitosamente.",
        details: [
          `ID: #${controlToReactivate.id}`,
          `Consultante: ${controlToReactivate.nombre_consultante || 'No especificado'}`,
          `Fecha: ${controlToReactivate.fecha_dia}/${controlToReactivate.fecha_mes}/${controlToReactivate.fecha_ano}`,
          "Estado: Activo"
        ],
        type: "success"
      })
      setShowInfoModal(true)
      
    } catch (error) {
      console.error('Error reactivando control:', error)
      setInfoModalData({
        title: "Error al Reactivar",
        message: "No se pudo reactivar el control operativo. Inténtalo nuevamente.",
        type: "info"
      })
      setShowInfoModal(true)
    } finally {
      setControlToReactivate(null)
    }
  }

  const openPdfModal = (control) => {
    setPdfInfo(control)
    setShowPdfModal(true)
  }

  const handleGeneratePDF = async () => {
    if (!pdfInfo) return
    
    try {
      const response = await axios.get(`/api/control-operativo/${pdfInfo.id}/pdf`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `control_operativo_${pdfInfo.id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      
      // Mostrar modal informativo
      setInfoModalData({
        title: "PDF Generado Exitosamente",
        message: "El documento PDF ha sido generado y descargado.",
        details: [
          `Archivo: control_operativo_${pdfInfo.id}.pdf`,
          `ID del Control: #${pdfInfo.id}`,
          `Consultante: ${pdfInfo.nombre_consultante || 'No especificado'}`,
          `Tamaño: ${(blob.size / 1024).toFixed(1)} KB`
        ],
        type: "download"
      })
      setShowInfoModal(true)
      
    } catch (error) {
      console.error('Error generando PDF:', error)
      setInfoModalData({
        title: "Error al Generar PDF",
        message: "No se pudo generar el documento PDF. Inténtalo nuevamente.",
        type: "info"
      })
      setShowInfoModal(true)
    } finally {
      setPdfInfo(null)
    }
  }

  const resetFormData = () => {
    setFormData({
      ciudad: 'Bogotá D.C',
      fecha_dia: new Date().getDate(),
      fecha_mes: new Date().getMonth() + 1,
      fecha_ano: new Date().getFullYear(),
      nombre_docente_responsable: '',
      nombre_estudiante: '',
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
Nuevo Control Operativo
              </h1>
              <button
                onClick={cancelarFormulario}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* I. DATOS DEL USUARIO */}
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
                      Nombre del Estudiante *
                    </label>
                    <input
                      type="text"
                      name="nombre_estudiante"
                      value={formData.nombre_estudiante}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      placeholder="Nombre completo del estudiante responsable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área de Consulta *
                    </label>
                    <input
                      type="text"
                      name="area_consulta"
                      value={formData.area_consulta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                      placeholder="Ej: Derecho Civil, Derecho Penal, etc."
                    />
                  </div>
                </div>
              </div>

              {/* II. INFORMACIÓN GENERAL DEL CONSULTANTE */}
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

                {/* Datos personales */}
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

                {/* Fecha de nacimiento y lugar */}
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

                {/* Documento */}
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

                {/* Ubicación y contacto */}
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

              {/* III. BREVE DESCRIPCIÓN DEL CASO */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* IV. CONCEPTO DEL ESTUDIANTE */}
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
                    placeholder="Concepto del estudiante..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* V. CONCEPTO DEL ASESOR JURÍDICO */}
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
                    placeholder="Concepto del asesor jurídico..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* VII. PRUEBAS Y DOCUMENTOS ADJUNTOS */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-university-purple mb-4">
                  VII. PRUEBAS Y DOCUMENTOS ADJUNTOS
                </h2>
                
                {!editingId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      ℹ️ Debes guardar el control operativo primero para poder adjuntar documentos.
                    </p>
                  </div>
                )}

                {editingId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subir documento o prueba
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-university-blue file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                      />
                      {uploadingFile && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos permitidos: PDF, JPG, PNG, DOC, DOCX. Tamaño máximo: 10MB
                    </p>
                  </div>
                )}

                {/* Lista de documentos */}
                {documentos.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Documentos adjuntos:</h3>
                    <div className="space-y-2">
                      {documentos.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-university-purple">{doc.filename}</p>
                            <p className="text-xs text-gray-500">
                              Subido por {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              • {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          {editingId && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition-colors duration-200"
                              title="Eliminar documento"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {documentos.length === 0 && editingId && (
                  <div className="text-center py-6 text-gray-500">
                    <p>No hay documentos adjuntos</p>
                    <p className="text-sm">Los documentos adjuntos aparecerán listados en el PDF generado</p>
                  </div>
                )}
              </div>

              {/* Botones */}
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
                  onClick={() => console.log('🔥 Botón Guardar clickeado')}
                  className="bg-university-blue hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
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
              Control Operativo de Consulta Jurídica
            </h1>
            <button
              onClick={() => {
                console.log('🔥 Botón Nuevo Control Operativo clickeado')
                console.log('📝 Estado actual showForm:', showForm)
                setShowForm(true)
                console.log('📝 Después de setShowForm(true)')
              }}
              className="bg-university-purple hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nuevo Control Operativo</span>
            </button>
          </div>

          {/* Dashboard de Métricas */}
          {controles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Reportes</div>
                <div className="text-2xl font-semibold text-university-purple mt-1">{controles.length}</div>
              </div>
              
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Este Mes</div>
                <div className="text-2xl font-semibold text-university-purple mt-1">
                  {controles.filter(c => {
                    const createdDate = new Date(c.fecha_creacion || c.created_at)
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
              <p className="text-gray-500 mt-2">Haz clic en "Nuevo Control" para comenzar</p>
            </div>
          )}

          {controles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-university-purple">Controles Operativos</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Gestiona todos los controles operativos del sistema
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
                        Estudiante
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
                      <tr key={control.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-university-purple">
                          <div className="flex items-center">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              #{control.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {control.fecha_dia && control.fecha_mes && control.fecha_ano
                            ? `${control.fecha_dia}/${control.fecha_mes}/${control.fecha_ano}`
                            : <span className="text-gray-400 italic">No definida</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-university-purple">
                            {control.nombre_consultante || <span className="text-gray-400 italic">Sin nombre</span>}
                          </div>
                          {control.numero_documento && (
                            <div className="text-xs text-gray-500">Doc: {control.numero_documento}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-university-purple">
                            {control.nombre_estudiante || <span className="text-gray-400 italic">Sin asignar</span>}
                          </div>
                          <div className="text-xs text-gray-500">
                            Creado: {new Date(control.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                            control.activo 
                              ? 'bg-gray-100 text-gray-800 border border-gray-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {control.activo ? 'Activo' : 'Eliminado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openPdfModal(control)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Descargar PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            {control.activo ? (
                              <button
                                onClick={() => openDeleteModal(control)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar control operativo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={() => openReactivateModal(control)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Reactivar control operativo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      Total: <span className="font-semibold">{controles.length}</span> controles operativos
                    </div>
                    <div className="flex gap-4">
                      <span>✅ Activos: <span className="font-semibold text-green-600">{controles.filter(c => c.activo).length}</span></span>
                      <span>❌ Eliminados: <span className="font-semibold text-red-600">{controles.filter(c => !c.activo).length}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        message={
          controlToDelete
            ? `¿Realmente quiere eliminar este control operativo?

Los coordinadores podrán reactivarlo más tarde si es necesario.

ID: ${controlToDelete.id}`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de confirmación para reactivar */}
      <ConfirmModal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={handleReactivate}
        title="Confirmar reactivación"
        message={
          controlToReactivate
            ? `¿Desea reactivar este control operativo?

El control volverá a estar disponible y activo en el sistema.

ID: #${controlToReactivate.id}
Consultante: ${controlToReactivate.nombre_consultante || 'No especificado'}`
            : ""
        }
        confirmText="Reactivar"
        cancelText="Cancelar"
        type="warning"
      />

      {/* Modal de confirmación para PDF */}
      <ConfirmModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        onConfirm={handleGeneratePDF}
        title="Generar documento PDF"
        message={
          pdfInfo
            ? `¿Desea generar y descargar el PDF de este control operativo?

ID: #${pdfInfo.id}
Consultante: ${pdfInfo.nombre_consultante || 'No especificado'}
Fecha: ${pdfInfo.fecha_dia || 'N/A'}/${pdfInfo.fecha_mes || 'N/A'}/${pdfInfo.fecha_ano || 'N/A'}

El archivo se descargará automáticamente.`
            : ""
        }
        confirmText="Generar PDF"
        cancelText="Cancelar"
        type="info"
      />

      {/* Modal informativo */}
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

export default ControlOperativo