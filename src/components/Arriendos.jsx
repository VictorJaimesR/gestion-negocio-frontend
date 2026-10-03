import { Fragment, useState, useEffect, useCallback } from 'react'
import { AccionesTabla } from './AccionesTabla'
import { apiFetch, leerRespuesta } from '../api'
import CampoNumero from './CampoNumero'
import { formatearMoneda, formatearFecha } from './formatters'
import ModalRegistrarMovimiento from './ModalRegistrarMovimiento'
import ResumenAbonos from './ResumenAbonos'

const ordenEstadosPago = {
  parcialmente_pagada: 0,
  pendiente: 1,
  vencida: 2,
  pagada: 3,
}

function ordenarPorEstadoPago(registros) {
  return [...registros].sort((a, b) => (
    (ordenEstadosPago[a.estado] ?? 99) - (ordenEstadosPago[b.estado] ?? 99)
  ))
}

function Arriendos() {
  const [arriendos, setArriendos] = useState([])
  const [arriendoExpandido, setArriendoExpandido] = useState(null)
  const [inmuebles, setInmuebles] = useState([])
  const [personas, setPersonas] = useState([])
  const [inmueble, setInmueble] = useState('')
  const [arrendatario, setArrendatario] = useState('')
  const [canon_mensual, setCanonMensual] = useState('')
  const [fecha_inicio, setFechaInicio] = useState('')
  const [fecha_fin, setFechaFin] = useState('')
  const [dia_pago, setDiaPago] = useState('')
  const [estado, setEstado] = useState('activo')
  const [arriendoEditando, setArriendoEditando] = useState(null)
  const [movimientoModal, setMovimientoModal] = useState(null)

  const cargarDatos = useCallback(() => {
    Promise.all([
      apiFetch('/arriendos/').then((response) => leerRespuesta(response, 'No se pudieron cargar los arriendos')),
      apiFetch('/inmuebles/').then((response) => leerRespuesta(response, 'No se pudieron cargar los inmuebles')),
      apiFetch('/personas/').then((response) => leerRespuesta(response, 'No se pudieron cargar las personas')),
    ]).then(([arriendosData, inmueblesData, personasData]) => {
      setArriendos(arriendosData)
      setInmuebles(inmueblesData)
      setPersonas(personasData)
    })
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  function limpiarFormulario() {
    setInmueble('')
    setArrendatario('')
    setCanonMensual('')
    setFechaInicio('')
    setFechaFin('')
    setDiaPago('')
    setEstado('activo')
    setArriendoEditando(null)
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    const nuevoArriendo = {
      inmueble,
      arrendatario,
      canon_mensual,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      dia_pago,
      estado,
    }
    apiFetch(arriendoEditando ? `/arriendos/${arriendoEditando}/` : '/arriendos/', {
      method: arriendoEditando ? 'PUT' : 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(nuevoArriendo),
    })
      .then((response) => leerRespuesta(response, 'No se pudo guardar el arriendo'))
      .then(() => {
        limpiarFormulario()
        cargarDatos()
      })
      .catch((error) => window.alert(error.message))
  }

  function editarArriendo(arriendo) {
    setArriendoEditando(arriendo.id)
    setInmueble(String(arriendo.inmueble_id))
    setArrendatario(String(arriendo.arrendatario_id))
    setCanonMensual(arriendo.canon_mensual)
    setFechaInicio(arriendo.fecha_inicio)
    setFechaFin(arriendo.fecha_fin || '')
    setDiaPago(arriendo.dia_pago)
    setEstado(arriendo.estado)
  }

  function eliminarArriendo(arriendo) {
    if (arriendo.estado !== 'finalizado') {
      window.alert('Solo se puede eliminar un arriendo finalizado.')
      return
    }
    if (!window.confirm('¿Seguro que deseas eliminar este arriendo y sus obligaciones?')) return
    apiFetch(`/arriendos/${arriendo.id}/`, {method: 'DELETE'})
      .then((response) => leerRespuesta(response, 'No se pudo eliminar el arriendo'))
      .then(() => cargarDatos())
      .catch((error) => window.alert(error.message))
  }

  return (
    <section className="app-view">
      <div className="view-heading"><div><p className="eyebrow">Gestión inmobiliaria</p><h2>Arriendos</h2><p className="view-subtitle">Administra contratos, cánones y obligaciones.</p></div><span className="view-badge">{arriendos.length} arriendos</span></div>
      <form className="entity-form" onSubmit={manejarEnvio}>
        <select value={inmueble} onChange={(e) => setInmueble(e.target.value)} required>
          <option value="">Seleccione un inmueble</option>
          {inmuebles.filter((item) => item.estado === 'disponible' || String(item.id) === inmueble).map((item) => (
            <option key={item.id} value={item.id}>{item.tipo} - {item.descripcion}</option>
          ))}
        </select>
        <select value={arrendatario} onChange={(e) => setArrendatario(e.target.value)} required>
          <option value="">Seleccione un arrendatario</option>
          {personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.nombre} - {persona.cedula}</option>)}
        </select>
        <CampoNumero placeholder="Canon mensual" value={canon_mensual} onChange={setCanonMensual} required />
        <label className="field-label">
          Fecha de inicio del contrato
          <input type="date" value={fecha_inicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        </label>
        <label className="field-label">
          Fecha de fin del contrato
          <input type="date" value={fecha_fin} onChange={(e) => setFechaFin(e.target.value)} />
        </label>
        <input type="number" placeholder="Día de pago" min="1" max="31" value={dia_pago} onChange={(e) => setDiaPago(e.target.value)} required />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
          <option value="activo">Activo</option><option value="finalizado">Finalizado</option>
        </select>
        <button type="submit">{arriendoEditando ? 'Actualizar Arriendo' : 'Agregar Arriendo'}</button>
        {arriendoEditando && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
      </form>

      <div className="table-wrap"><table className="data-table">
        <thead><tr><th></th><th>Inmueble</th><th>Arrendatario</th><th>Canon Mensual</th><th>Día de Pago</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {arriendos.map((arriendo) => (
            <Fragment key={arriendo.id}>
              <tr>
                <td><button type="button" onClick={() => setArriendoExpandido(arriendoExpandido === arriendo.id ? null : arriendo.id)}>{arriendoExpandido === arriendo.id ? '−' : '+'}</button></td>
                <td>{arriendo.inmueble}</td><td>{arriendo.arrendatario}</td><td>{formatearMoneda(arriendo.canon_mensual)}</td><td>{arriendo.dia_pago}</td><td><span className={`status status-${arriendo.estado}`}>{arriendo.estado}</span></td>
                <td><AccionesTabla onEditar={() => editarArriendo(arriendo)} onEliminar={() => eliminarArriendo(arriendo)} /></td>
              </tr>
              {arriendoExpandido === arriendo.id && (
                <tr><td colSpan="7" className="detail-cell"><strong>Obligaciones</strong><table><thead><tr><th>Periodo</th><th>Vencimiento</th><th>Valor</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                  {ordenarPorEstadoPago(arriendo.obligaciones).map((obligacion) => <tr key={obligacion.id}><td>{formatearFecha(obligacion.periodo)}</td><td>{formatearFecha(obligacion.fecha_vencimiento)}</td><td>{formatearMoneda(obligacion.valor_obligacion)}</td><td><span className={`status status-${obligacion.estado}`}>{obligacion.estado}</span><ResumenAbonos movimientos={obligacion.movimientos} /></td><td><div className="acciones-tabla">{['pendiente', 'parcialmente_pagada'].includes(obligacion.estado) && <button type="button" className="accion-pago" onClick={() => setMovimientoModal({tipo: 'pago_arriendo', id: obligacion.id, movimientos: obligacion.movimientos, etiqueta: `Periodo ${formatearFecha(obligacion.periodo)} - ${formatearMoneda(obligacion.valor_obligacion)} - Vence ${formatearFecha(obligacion.fecha_vencimiento)}`})} aria-label="Registrar pago" title="Registrar pago">$</button>}</div></td></tr>)}
                </tbody></table></td></tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table></div>
      {movimientoModal && <ModalRegistrarMovimiento tipo={movimientoModal.tipo} idRelacionado={movimientoModal.id} etiqueta={movimientoModal.etiqueta} movimientos={movimientoModal.movimientos} onCerrar={() => setMovimientoModal(null)} onRegistrado={cargarDatos} />}
    </section>
  )
}

export default Arriendos
