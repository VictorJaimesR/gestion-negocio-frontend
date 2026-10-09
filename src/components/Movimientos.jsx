import { useCallback, useEffect, useState } from 'react'
import { cachedGet, getCachedData } from '../dataCache'
import { Feedback } from './Feedback'
import { formatearMoneda, formatearFecha } from './formatters'

const tiposMovimiento = {
  pago_cuota: 'Pago de Cuota',
  pago_arriendo: 'Pago de Arriendo',
  pago_honorario: 'Pago de Honorario',
}

function Movimientos() {
  const [movimientos, setMovimientos] = useState(() => getCachedData('/movimientos/') || [])
  const [error, setError] = useState('')

  const cargarMovimientos = useCallback(() => {
    return cachedGet('/movimientos/', 'No se pudieron cargar los movimientos')
      .then(setMovimientos)
  }, [])

  useEffect(() => {
    cargarMovimientos().catch((error) => setError(error.message))
  }, [cargarMovimientos])

  return (
    <section className="app-view">
      <div className="view-heading">
        <div>
          <p className="eyebrow">Control financiero</p>
          <h2>Movimientos</h2>
          <p className="view-subtitle">Consulta el historial de pagos registrados.</p>
        </div>
        <Feedback error={error} />
        <span className="view-badge">{movimientos.length} movimientos</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Relacionado con</th>
              <th>Fecha</th>
              <th>Valor</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{tiposMovimiento[movimiento.tipo] || movimiento.tipo}</td>
                <td>{movimiento.cuota || movimiento.obligacion_arriendo || movimiento.honorario || 'Sin relación'}</td>
                <td>{formatearFecha(movimiento.fecha)}</td>
                <td>{formatearMoneda(movimiento.valor)}</td>
                <td>{movimiento.observaciones || '—'}</td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan="5">No hay movimientos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Movimientos
