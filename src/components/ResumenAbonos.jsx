import { formatearFecha, formatearMoneda } from './formatters'

function ResumenAbonos({ movimientos = [] }) {
  if (movimientos.length === 0) return null

  return (
    <div className="payment-history">
      {movimientos.map((movimiento) => (
        <div key={movimiento.id}>
          - Se pagó {formatearMoneda(movimiento.valor)} el {formatearFecha(movimiento.fecha)}
        </div>
      ))}
    </div>
  )
}

export default ResumenAbonos
