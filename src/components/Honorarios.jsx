import { useState, useEffect, useCallback } from 'react'
import { AccionesTabla } from './AccionesTabla'
import { leerRespuesta } from './api'
import CampoNumero from './CampoNumero'
import { formatearMoneda, formatearFecha } from './formatters'

function Honorarios() {
  const [honorarios, setHonorarios] = useState([])
  const [personas, setPersonas] = useState([])
  const [cliente, setCliente] = useState('')
  const [concepto, setConcepto] = useState('')
  const [valor_honorario, setValorHonorario] = useState('')
  const [fecha_emision, setFechaEmision] = useState('')
  const [fecha_vencimiento, setFechaVencimiento] = useState('')
  const [estado, setEstado] = useState('')
  const [honorarioEditando, setHonorarioEditando] = useState(null)

  const cargarPersonas = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/personas/')
      .then((response) => response.json())
      .then((data) => setPersonas(data))
  }, [])

  const cargarHonorarios = useCallback(() => {
    cargarPersonas()
    fetch('http://127.0.0.1:8000/api/honorarios/')
      .then((response) => response.json())
      .then((data) => setHonorarios(data))
  }, [cargarPersonas])

  useEffect(() => {
    cargarHonorarios()
  }, [cargarHonorarios])

  function limpiarFormulario() {
    setCliente('')
    setConcepto('')
    setValorHonorario('')
    setFechaEmision('')
    setFechaVencimiento('')
    setEstado('')
    setHonorarioEditando(null)
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    const nuevoHonorario = {
      cliente,
      concepto,
      valor_honorario,
      fecha_emision,
      fecha_vencimiento,
      estado,
    }
    const url = honorarioEditando
      ? `http://127.0.0.1:8000/api/honorarios/${honorarioEditando}/`
      : 'http://127.0.0.1:8000/api/honorarios/'

    fetch(url, {
      method: honorarioEditando ? 'PUT' : 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(nuevoHonorario),
    })
      .then((response) => leerRespuesta(response, 'No se pudo guardar el honorario'))
      .then(() => {
        limpiarFormulario()
        cargarHonorarios()
      })
      .catch((error) => window.alert(error.message))
  }

  function editarHonorario(honorario) {
    setHonorarioEditando(honorario.id)
    setCliente(String(honorario.cliente_id))
    setConcepto(honorario.concepto)
    setValorHonorario(honorario.valor_honorario)
    setFechaEmision(honorario.fecha_emision)
    setFechaVencimiento(honorario.fecha_vencimiento)
    setEstado(honorario.estado)
  }

  function eliminarHonorario(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este honorario?')) return
    fetch(`http://127.0.0.1:8000/api/honorarios/${id}/`, {method: 'DELETE'})
      .then((response) => leerRespuesta(response, 'No se pudo eliminar el honorario'))
      .then(() => cargarHonorarios())
      .catch((error) => window.alert(error.message))
  }

  return (
    <section className="app-view">
      <div className="view-heading"><div><p className="eyebrow">Gestión de servicios</p><h2>Honorarios</h2><p className="view-subtitle">Controla servicios profesionales y sus vencimientos.</p></div><span className="view-badge">{honorarios.length} honorarios</span></div>
      <form className="entity-form" onSubmit={manejarEnvio}>
        <select name="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} required>
          <option value="">Seleccione un cliente</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>{persona.nombre}</option>
          ))}
        </select>
        <input type="text" placeholder="Concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} required />
        <CampoNumero placeholder="Valor honorario" value={valor_honorario} onChange={setValorHonorario} required />
        <input type="date" value={fecha_emision} onChange={(e) => setFechaEmision(e.target.value)} required />
        <input type="date" value={fecha_vencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} required />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
          <option value="">Seleccione un estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcialmente_pagada">Pago parcial</option>
          <option value="pagada">Pagado</option>
        </select>
        <button type="submit">{honorarioEditando ? 'Actualizar Honorario' : 'Agregar Honorario'}</button>
        {honorarioEditando && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
      </form>

      <div className="table-wrap"><table className="data-table">
        <thead>
          <tr>
            <th>Cliente</th><th>Concepto</th><th>Valor</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {honorarios.map((honorario) => (
            <tr key={honorario.id}>
              <td>{honorario.cliente}</td>
              <td>{honorario.concepto}</td>
              <td>{formatearMoneda(honorario.valor_honorario)}</td>
              <td>{formatearFecha(honorario.fecha_vencimiento)}</td>
              <td><span className={`status status-${honorario.estado}`}>{honorario.estado}</span></td>
              <td><AccionesTabla onEditar={() => editarHonorario(honorario)} onEliminar={() => eliminarHonorario(honorario.id)} /></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </section>
  )
}

export default Honorarios
