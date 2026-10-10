import {useEffect, useState} from 'react'
import { AccionesTabla } from './AccionesTabla'
import { apiFetch, leerRespuesta } from '../api'
import { cachedGet, getCachedData, invalidateCache } from '../dataCache'
import { Feedback } from './Feedback'
import { Plus } from 'lucide-react'

function Personas() {
  const [personas, setPersonas] = useState(() => getCachedData('/personas/') || [])
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [email, setEmail] = useState('')
    const [personaEditando, setPersonaEditando] = useState(null)
    const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  useEffect(() => {
    cargarPersonas()
    }, [])


function cargarPersonas() {
    cachedGet('/personas/', 'No se pudieron cargar las personas')
      .then((data) => setPersonas(data))
  }

function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setSuccess('')

    const nuevaPersona = {
        nombre: nombre,
        cedula: cedula,
        telefono: telefono,
        direccion: direccion,
        email: email
    }  
    
    apiFetch(personaEditando ? `/personas/${personaEditando}/` : '/personas/', {
        method: personaEditando ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(nuevaPersona),
    })
    .then((response) => leerRespuesta(response, 'No se pudo guardar la persona'))
    .then(() => {
        limpiarFormulario()
        invalidateCache('/personas/', '/ventas/', '/arriendos/', '/honorarios/', '/movimientos/')
        cargarPersonas()
        setSuccess(personaEditando ? 'Persona actualizada correctamente.' : 'Persona guardada correctamente.')
    })
    .catch((error) => setError(error.message))
}

function limpiarFormulario() {
    setNombre('')
    setCedula('')
    setTelefono('')
    setDireccion('')
    setEmail('')
    setPersonaEditando(null)
    setFormularioAbierto(false)
}

function editarPersona(persona) {
    setFormularioAbierto(true)
    setPersonaEditando(persona.id)
    setNombre(persona.nombre)
    setCedula(persona.cedula)
    setTelefono(persona.telefono)
    setDireccion(persona.direccion)
    setEmail(persona.email)
}

function eliminarPersona(id) {
    if (!window.confirm('¿Seguro que deseas eliminar esta persona?')) return
    apiFetch(`/personas/${id}/`, {method: 'DELETE'})
      .then((response) => leerRespuesta(response, 'No se pudo eliminar la persona'))
      .then(() => {
        invalidateCache('/personas/', '/ventas/', '/arriendos/', '/honorarios/', '/movimientos/')
        cargarPersonas()
      })
      .catch((error) => setError(error.message))
}

  return (
    <section className="app-view">
      <div className="view-heading"><div><p className="eyebrow">Directorio</p><h2>Personas</h2><p className="view-subtitle">Gestiona clientes, compradores y arrendatarios.</p></div><span className="view-badge">{personas.length} personas</span></div>
      <Feedback error={error} success={success} />

      {!formularioAbierto && <button type="button" className="add-record-button" onClick={() => setFormularioAbierto(true)}><Plus size={18} strokeWidth={2.2} aria-hidden="true" /> Agregar persona</button>}
    {formularioAbierto && <form className="entity-form" onSubmit={manejarEnvio}>
        <input 
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
        />
        <input 
            type="text"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
        />
        <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
        />
        <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
        />
        <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <button type="submit">{personaEditando ? 'Actualizar Persona' : 'Guardar Persona'}</button>
        {personaEditando && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
      </form>}

        <div className="table-wrap"><table className="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {personas.map((persona) => (
                    <tr key={persona.id}>
                        <td data-label="ID">{persona.id}</td>
                        <td data-label="Nombre">{persona.nombre}</td>
                        <td data-label="Cédula">{persona.cedula}</td>
                        <td data-label="Teléfono">{persona.telefono}</td>
                        <td data-label="Correo">{persona.email}</td>
                        <td data-label="Acciones">
                            <AccionesTabla
                                onEditar={() => editarPersona(persona)}
                                onEliminar={() => eliminarPersona(persona.id)}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table></div>
    </section>
  )
}

export default Personas