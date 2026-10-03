import { useEffect, useState } from 'react'
import { apiFetch, leerRespuesta } from '../api'

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
})

function formatearMoneda(valor) {
  return `$ ${formatoMoneda.format(Number(valor) || 0)}`
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function esVencida(fecha) {
  if (!fecha) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return new Date(`${fecha}T00:00:00`) < hoy
}

function etiquetaEstado(estado) {
  const etiquetas = {
    pendiente: 'Pendiente',
    parcialmente_pagada: 'Pago parcial',
    pagada: 'Pagada',
    vencida: 'Vencida',
  }
  return etiquetas[estado] || estado
}

function construirCuentas(ventas, arriendos, honorarios) {
  const cuentasVentas = ventas.flatMap((venta) => {
    const cuotas = venta.financiamiento?.cuotas || []
    return cuotas
      .filter((cuota) => cuota.estado !== 'pagada')
      .map((cuota) => ({
        id: `venta-${venta.id}-${cuota.id}`,
        persona: venta.comprador,
        negocio: 'Venta',
        referencia: `${venta.inmueble} · Cuota ${cuota.numero_cuota}`,
        vencimiento: cuota.fecha_vencimiento,
        monto: Number(cuota.valor_cuota) || 0,
        estado: cuota.estado,
      }))
  })

  const cuentasArriendos = arriendos.flatMap((arriendo) => {
    const obligaciones = arriendo.obligaciones || []
    return obligaciones
      .filter((obligacion) => obligacion.estado !== 'pagada')
      .map((obligacion) => ({
        id: `arriendo-${arriendo.id}-${obligacion.id}`,
        persona: arriendo.arrendatario,
        negocio: 'Arriendo',
        referencia: `${arriendo.inmueble} · ${obligacion.periodo}`,
        vencimiento: obligacion.fecha_vencimiento,
        monto: Number(obligacion.valor_obligacion) || 0,
        estado: obligacion.estado,
      }))
  })

  const cuentasHonorarios = honorarios
    .filter((honorario) => honorario.estado !== 'pagada')
    .map((honorario) => ({
      id: `honorario-${honorario.id}`,
      persona: honorario.cliente,
      negocio: 'Honorario',
      referencia: honorario.concepto,
      vencimiento: honorario.fecha_vencimiento,
      monto: Number(honorario.valor_honorario) || 0,
      estado: honorario.estado,
    }))

  return [...cuentasVentas, ...cuentasArriendos, ...cuentasHonorarios]
    .map((cuenta) => ({
      ...cuenta,
      estado: esVencida(cuenta.vencimiento) ? 'vencida' : cuenta.estado,
    }))
    .sort((a, b) => (a.vencimiento || '').localeCompare(b.vencimiento || ''))
}

function CuentasPorCobrar() {
  const [cuentas, setCuentas] = useState([])
  const [filtroNegocio, setFiltroNegocio] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuestas = await Promise.all([
          apiFetch('/ventas/').then((response) => leerRespuesta(response, 'No se pudieron cargar las ventas')),
          apiFetch('/arriendos/').then((response) => leerRespuesta(response, 'No se pudieron cargar los arriendos')),
          apiFetch('/honorarios/').then((response) => leerRespuesta(response, 'No se pudieron cargar los honorarios')),
        ])
        const [ventas, arriendos, honorarios] = respuestas
        setCuentas(construirCuentas(ventas, arriendos, honorarios))
      } catch (errorCarga) {
        setError(errorCarga.message)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  const cuentasFiltradas = cuentas.filter((cuenta) => {
    const coincideNegocio = filtroNegocio === 'todos' || cuenta.negocio === filtroNegocio
    const coincideEstado = filtroEstado === 'todos'
      || (filtroEstado === 'por_vencer'
        ? cuenta.estado !== 'vencida'
        : cuenta.estado === filtroEstado)
    const texto = `${cuenta.persona} ${cuenta.referencia}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    return coincideNegocio && coincideEstado && coincideBusqueda
  })

  const totalGeneral = cuentas.reduce((total, cuenta) => total + cuenta.monto, 0)
  const totalVencido = cuentas
    .filter((cuenta) => cuenta.estado === 'vencida')
    .reduce((total, cuenta) => total + cuenta.monto, 0)
  const totalPorVencer = totalGeneral - totalVencido
  const deudores = new Set(cuentas.map((cuenta) => cuenta.persona)).size
  const resumenPersonas = Object.values(cuentas.reduce((resumen, cuenta) => {
    const persona = resumen[cuenta.persona] || { nombre: cuenta.persona, total: 0, obligaciones: 0 }
    persona.total += cuenta.monto
    persona.obligaciones += 1
    resumen[cuenta.persona] = persona
    return resumen
  }, {})).sort((a, b) => b.total - a.total)

  return (
    <section className="cobros-dashboard">
      <div className="cobros-heading">
        <div>
          <p className="eyebrow">Control financiero</p>
          <h2>Cuentas por cobrar</h2>
          <p className="cobros-subtitle">Seguimiento de saldos pendientes de ventas, arriendos y honorarios.</p>
        </div>
        <div className="cobros-periodo">Actualizado hoy</div>
      </div>

      {cargando && <p className="cobros-message">Cargando cuentas...</p>}
      {error && <p className="cobros-message cobros-error">{error}</p>}

      {!cargando && !error && (
        <>
          <div className="cobros-summary">
            <article className="cobros-card cobros-card-primary">
              <span>Total pendiente</span>
              <strong>{formatearMoneda(totalGeneral)}</strong>
              <small>{cuentas.length} obligaciones abiertas</small>
            </article>
            <article className="cobros-card">
              <span>Vencido</span>
              <strong>{formatearMoneda(totalVencido)}</strong>
              <small>Requiere seguimiento</small>
            </article>
            <article className="cobros-card">
              <span>Por vencer</span>
              <strong>{formatearMoneda(totalPorVencer)}</strong>
              <small>Dentro del calendario</small>
            </article>
            <article className="cobros-card">
              <span>Personas con saldo</span>
              <strong>{deudores}</strong>
              <small>Deudores registrados</small>
            </article>
          </div>

          <div className="cobros-toolbar">
            <label>
              Buscar
              <input
                type="search"
                placeholder="Persona o referencia"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </label>
            <label>
              Negocio
              <select value={filtroNegocio} onChange={(evento) => setFiltroNegocio(evento.target.value)}>
                <option value="todos">Todos</option>
                <option value="Venta">Ventas</option>
                <option value="Arriendo">Arriendos</option>
                <option value="Honorario">Honorarios</option>
              </select>
            </label>
            <label>
              Estado
              <select value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)}>
                <option value="todos">Todos</option>
                <option value="vencida">Vencidas</option>
                <option value="por_vencer">Por vencer</option>
                <option value="pendiente">Pendientes</option>
                <option value="parcialmente_pagada">Pagos parciales</option>
              </select>
            </label>
            <span className="cobros-resultados">{cuentasFiltradas.length} resultados</span>
          </div>

          <div className="cobros-people-summary">
            <div className="cobros-section-heading">
              <div>
                <h3>Resumen por cliente</h3>
                <p>Total acumulado de obligaciones abiertas por deudor.</p>
              </div>
            </div>
            <div className="cobros-people-table-wrap">
              <table className="cobros-table cobros-people-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Obligaciones</th>
                    <th className="cobros-amount">Total adeudado</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenPersonas.map((persona) => (
                    <tr key={persona.nombre}>
                      <td className="cobros-persona">{persona.nombre}</td>
                      <td>{persona.obligaciones}</td>
                      <td className="cobros-amount">{formatearMoneda(persona.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cobros-table-wrap">
            <table className="cobros-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Negocio</th>
                  <th>Referencia</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th className="cobros-amount">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {cuentasFiltradas.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td className="cobros-persona">{cuenta.persona}</td>
                    <td><span className={`cobros-tag cobros-tag-${cuenta.negocio.toLowerCase()}`}>{cuenta.negocio}</span></td>
                    <td>{cuenta.referencia}</td>
                    <td>{formatearFecha(cuenta.vencimiento)}</td>
                    <td><span className={`cobros-status cobros-status-${cuenta.estado}`}>{etiquetaEstado(cuenta.estado)}</span></td>
                    <td className="cobros-amount">{formatearMoneda(cuenta.monto)}</td>
                  </tr>
                ))}
                {cuentasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="6" className="cobros-empty">No hay cuentas que coincidan con los filtros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default CuentasPorCobrar
