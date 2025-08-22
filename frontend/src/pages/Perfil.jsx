import { useAuth } from '../contexts/AuthContext'
import PerfilEstudiante from './estudiante/PerfilEstudiante'
import PerfilCoordinador from './coordinador/PerfilCoordinador'

const Perfil = () => {
  const { user } = useAuth()

  // Renderizar perfil específico según el rol
  if (user?.role === 'coordinador') {
    return <PerfilCoordinador />
  }
  
  if (user?.role === 'estudiante') {
    return <PerfilEstudiante />
  }

  // Fallback para roles no definidos
  return (
    <div className="min-h-full bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Perfil no disponible
        </h1>
        <p className="text-gray-600">
          Tu rol no está definido. Contacta al administrador.
        </p>
      </div>
    </div>
  )
}

export default Perfil