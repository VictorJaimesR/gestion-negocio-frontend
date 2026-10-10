import { Fragment, useState, useEffect, useCallback } from 'react'
import { AccionesTabla } from './AccionesTabla'
import { apiFetch, leerRespuesta } from '../api'
import { cachedGet, getCachedData, invalidateCache } from '../dataCache'
import CampoNumero from './CampoNumero'
import { formatearMoneda, formatearFecha } from './formatters'
import ModalRegistrarMovimiento from './ModalRegistrarMovimiento'
import ResumenAbonos from './ResumenAbonos'
import { Feedback } from './Feedback'
import { ChevronDown, ChevronRight, DollarSign, Plus } from 'lucide-react'

function calcularValorCuota(precio, pagoInicial, numeroCuotas) {
  if (
    precio === ''
    || pagoInicial === ''
    || numeroCuotas === ''
    || Number(precio) <= 0
    || Number(pagoInicial) < 0
    || Number(pagoInicial) > Number(precio)
    || Number(numeroCuotas) <= 0
  ) {
    return ''
  }

  return ((Number(precio) - Number(pagoInicial)) / Number(numeroCuotas)).toFixed(2)
}

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

const ordenEstadosVenta = {
  activa: 0,
  pagada: 1,
  cancelada: 2,
}

function ordenarVentas(registros) {
  return [...registros].sort((a, b) => (
    (ordenEstadosVenta[a.estado] ?? 99) - (ordenEstadosVenta[b.estado] ?? 99)
  ))
}

function Ventas() {
  const [ventas, setVentas] = useState(() => getCachedData('/ventas/') || [])
  const [ventaExpandida, setVentaExpandida] = useState(null)
  const [inmuebles, setInmuebles] = useState(() => getCachedData('/inmuebles/') || [])
  const [personas, setPersonas] = useState(() => getCachedData('/personas/') || [])
  const [inmueble, setInmueble] = useState('')
  const [comprador, setComprador] = useState('')
  const [fecha_venta, setFechaVenta] = useState('')
  const [precio_venta, setPrecioVenta] = useState('')
  const [estado, setEstado] = useState('')
  const [tipoPago, setTipoPago] = useState('contado')
  const [pago_inicial, setPagoInicial] = useState('')
  const [numero_cuotas, setNumeroCuotas] = useState('')
  const [ventaEditando, setVentaEditando] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [movimientoModal, setMovimientoModal] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const cargarInmuebles = useCallback((force = false) => {
    return cachedGet('/inmuebles/', 'No se pudieron cargar los inmuebles', {force}).then(setInmuebles)
  }, [])

  const cargarPersonas = useCallback((force = false) => {
    return cachedGet('/personas/', 'No se pudieron cargar las personas', {force}).then(setPersonas)
  }, [])

  const cargarVentas = useCallback((force = false, forceDependencies = false) => {
    cargarInmuebles(forceDependencies)
    cargarPersonas(forceDependencies)
    return cachedGet('/ventas/', 'No se pudieron cargar las ventas', {force}).then(setVentas)
  }, [cargarInmuebles, cargarPersonas])

  useEffect(() => {
    cargarVentas()
  }, [cargarVentas])

  function limpiarFormulario() {
    setInmueble('')
    setComprador('')
    setFechaVenta('')
    setPrecioVenta('')
    setEstado('')
    setTipoPago('contado')
    setPagoInicial('')
    setNumeroCuotas('')
    setVentaEditando(null)
    setFormularioAbierto(false)
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setSuccess('')
    const precio = Number(precio_venta)
    const pagoInicial = Number(pago_inicial)
    const cuotas = Number(numero_cuotas)
    const valorCuota = Number(calcularValorCuota(precio_venta, pago_inicial, numero_cuotas))

    if (tipoPago === 'financiada' && pagoInicial > precio) {
      setError('El pago inicial no puede ser mayor que el precio de venta.')
      return
    }

    if (tipoPago === 'financiada' && pagoInicial + (cuotas * valorCuota) < precio) {
      setError('El pago inicial más el valor de las cuotas debe cubrir el precio de venta.')
      return
    }

    const nuevaVenta = {
      inmueble,
      comprador,
      fecha_venta,
      precio_venta,
      estado,
      financiamiento: tipoPago === 'financiada'
        ? {pago_inicial, numero_cuotas, valor_cuota: valorCuota, fecha_inicio: fecha_venta}
        : null,
    }
    apiFetch(ventaEditando ? `/ventas/${ventaEditando}/` : '/ventas/', {
      method: ventaEditando ? 'PUT' : 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(nuevaVenta),
    })
      .then((response) => leerRespuesta(response, 'No se pudo guardar la venta'))
      .then(() => {
        limpiarFormulario()
        invalidateCache('/ventas/', '/inmuebles/')
        cargarVentas(true, true)
        setSuccess(ventaEditando ? 'Venta actualizada correctamente.' : 'Venta agregada correctamente.')
      })
      .catch((error) => setError(error.message))
  }

  function editarVenta(venta) {
    setFormularioAbierto(true)
    setVentaEditando(venta.id)
    setInmueble(String(venta.inmueble_id))
    setComprador(String(venta.comprador_id))
    setFechaVenta(venta.fecha_venta)
    setPrecioVenta(venta.precio_venta)
    setEstado(venta.estado)
    setTipoPago(venta.financiamiento ? 'financiada' : 'contado')
    setPagoInicial(venta.financiamiento?.pago_inicial || '')
    setNumeroCuotas(venta.financiamiento?.numero_cuotas || '')
  }

  function eliminarVenta(venta) {
    if (!['pagada', 'cancelada'].includes(venta.estado)) {
      setError('Solo se puede eliminar una venta pagada o cancelada.')
      return
    }
    if (!window.confirm('¿Seguro que deseas eliminar esta venta y su información de financiamiento?')) return
    apiFetch(`/ventas/${venta.id}/`, {method: 'DELETE'})
      .then((response) => leerRespuesta(response, 'No se pudo eliminar la venta'))
      .then(() => {
        invalidateCache('/ventas/', '/inmuebles/')
        cargarVentas(true, true)
      })
      .catch((error) => setError(error.message))
  }

  function alternarExpandir(id) {
    setVentaExpandida(ventaExpandida === id ? null : id)
  }

  const valorCuota = tipoPago === 'financiada'
    ? calcularValorCuota(precio_venta, pago_inicial, numero_cuotas)
    : ''

  return (
    <section className="app-view">
      <div className="view-heading"><div><p className="eyebrow">Gestión comercial</p><h2>Ventas</h2><p className="view-subtitle">Administra ventas de contado y financiadas.</p></div><span className="view-badge">{ventas.length} ventas</span></div>
      <Feedback error={error} success={success} />
      {!formularioAbierto && <button type="button" className="add-record-button" onClick={() => setFormularioAbierto(true)}><Plus size={18} strokeWidth={2.2} aria-hidden="true" /> Agregar venta</button>}
      {formularioAbierto && <form className="entity-form" onSubmit={manejarEnvio}>
        <select value={inmueble} onChange={(e) => setInmueble(e.target.value)} required>
          <option value="">Seleccione un inmueble</option>
          {inmuebles.filter((item) => item.estado === 'disponible' || String(item.id) === inmueble).map((item) => (
            <option key={item.id} value={item.id}>{item.tipo} - {item.descripcion}</option>
          ))}
        </select>
        <select value={comprador} onChange={(e) => setComprador(e.target.value)} required>
          <option value="">Seleccione un comprador</option>
          {personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.nombre} - {persona.cedula}</option>)}
        </select>
        <label className="field-label">
          Fecha de venta
        <input type="date" value={fecha_venta} onChange={(e) => setFechaVenta(e.target.value)} required />
        </label>
        <CampoNumero value={precio_venta} onChange={setPrecioVenta} placeholder="Precio de venta" required />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} required>
          <option value="">Seleccione un estado</option>
          <option value="activa">Activa</option>
          <option value="pagada">Pagada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)} required>
          <option value="contado">Contado</option>
          <option value="financiada">Financiada</option>
        </select>
        {tipoPago === 'financiada' && (
          <>
            <CampoNumero value={pago_inicial} onChange={setPagoInicial} placeholder="Pago inicial" required />
            <input type="number" min="1" step="1" value={numero_cuotas} onChange={(e) => setNumeroCuotas(e.target.value)} placeholder="Número de cuotas" required />
            <CampoNumero value={valorCuota} placeholder="Valor de cuota" readOnly required />
          </>
        )}
        <button type="submit">{ventaEditando ? 'Actualizar Venta' : 'Agregar Venta'}</button>
        {ventaEditando && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
      </form>}

      <div className="table-wrap"><table className="data-table">
        <thead><tr><th></th><th>Inmueble</th><th>Comprador</th><th>Fecha</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {ordenarVentas(ventas).map((venta) => (
            <Fragment key={venta.id}>
              <tr>
                <td data-label="Detalle"><button type="button" onClick={() => alternarExpandir(venta.id)} aria-label={ventaExpandida === venta.id ? 'Ocultar financiamiento' : 'Mostrar financiamiento'}>{ventaExpandida === venta.id ? <ChevronDown size={17} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}</button></td>
                <td data-label="Inmueble">{venta.inmueble}</td><td data-label="Comprador">{venta.comprador}</td><td data-label="Fecha">{formatearFecha(venta.fecha_venta)}</td><td data-label="Precio">{formatearMoneda(venta.precio_venta)}</td><td data-label="Estado"><span className={`status status-${venta.estado}`}>{venta.estado}</span></td>
                <td data-label="Acciones"><AccionesTabla onEditar={() => editarVenta(venta)} onEliminar={() => eliminarVenta(venta)} /></td>
              </tr>
              {ventaExpandida === venta.id && venta.financiamiento && (
                <tr><td colSpan="7" className="detail-cell"><strong>Financiamiento</strong><p>Pago inicial: {formatearMoneda(venta.financiamiento.pago_inicial)} | Capital financiado: {formatearMoneda(venta.financiamiento.capital_financiado)} | {venta.financiamiento.numero_cuotas} cuotas de {formatearMoneda(venta.financiamiento.valor_cuota)}</p>
                  <table className="nested-detail-table"><thead><tr><th>Cuota #</th><th>Vencimiento</th><th>Valor</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
                    {ordenarPorEstadoPago(venta.financiamiento.cuotas).map((cuota) => <tr key={cuota.id}><td data-label="Cuota">{cuota.numero_cuota}</td><td data-label="Vencimiento">{formatearFecha(cuota.fecha_vencimiento)}</td><td data-label="Valor">{formatearMoneda(cuota.valor_cuota)}</td><td data-label="Estado"><span className={`status status-${cuota.estado}`}>{cuota.estado}</span><ResumenAbonos movimientos={cuota.movimientos} /></td><td data-label="Acciones"><div className="acciones-tabla">{['pendiente', 'parcialmente_pagada'].includes(cuota.estado) && <button type="button" className="accion-pago" onClick={() => setMovimientoModal({tipo: 'pago_cuota', id: cuota.id, movimientos: cuota.movimientos, etiqueta: `Cuota #${cuota.numero_cuota} - ${formatearMoneda(cuota.valor_cuota)} - Vence ${formatearFecha(cuota.fecha_vencimiento)}`})} aria-label="Registrar pago" title="Registrar pago"><DollarSign size={16} strokeWidth={2} aria-hidden="true" /></button>}</div></td></tr>)}
                  </tbody></table>
                </td></tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table></div>
      {movimientoModal && <ModalRegistrarMovimiento tipo={movimientoModal.tipo} idRelacionado={movimientoModal.id} etiqueta={movimientoModal.etiqueta} movimientos={movimientoModal.movimientos} onCerrar={() => setMovimientoModal(null)} onRegistrado={cargarVentas} />}
    </section>
  )
}

export default Ventas
