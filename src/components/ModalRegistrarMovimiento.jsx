import { useState } from 'react'
import { apiFetch, leerRespuesta } from '../api'
import { invalidateCache } from '../dataCache'
import CampoNumero from './CampoNumero'
import { formatearMoneda } from './formatters'
import { Feedback } from './Feedback'

const etiquetasTipo = {
  pago_cuota: 'Registrar pago de cuota',
  pago_arriendo: 'Registrar pago de arriendo',
  pago_honorario: 'Registrar pago de honorario',
}

function fechaHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

function ModalRegistrarMovimiento({
  tipo,
  idRelacionado,
  etiqueta,
  movimientos = [],
  onCerrar,
  onRegistrado,
}) {
  const [fecha, setFecha] = useState(fechaHoy)
  const [valor, setValor] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const totalAbonado = movimientos.reduce(
    (total, movimiento) => total + Number(movimiento.valor || 0),
    0,
  )

  function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setGuardando(true)

    const movimiento = {
      tipo,
      fecha,
      valor,
      observaciones,
      cuota_id: tipo === 'pago_cuota' ? idRelacionado : null,
      obligacion_arriendo_id: tipo === 'pago_arriendo' ? idRelacionado : null,
      honorario_id: tipo === 'pago_honorario' ? idRelacionado : null,
    }

    apiFetch('/movimientos/', {
      method: 'POST',
      body: JSON.stringify(movimiento),
    })
      .then((response) => leerRespuesta(response, 'No se pudo registrar el pago'))
      .then(() => {
        const recursoRelacionado = {
          pago_cuota: '/ventas/',
          pago_arriendo: '/arriendos/',
          pago_honorario: '/honorarios/',
        }[tipo]
        invalidateCache('/movimientos/', recursoRelacionado)
        onRegistrado(true)
        onCerrar()
      })
      .catch((error) => setError(error.message))
      .finally(() => setGuardando(false))
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movimiento-titulo"
    >
      <div className="modal-content">
        <div className="view-heading">
          <div>
            <p className="eyebrow">Registro financiero</p>
            <h2 id="modal-movimiento-titulo">{etiquetasTipo[tipo]}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onCerrar} aria-label="Cerrar">×</button>
        </div>
        <p className="modal-label">Qué se está pagando</p>
        <p className="modal-description">
          {etiqueta}
          {totalAbonado > 0 && ` - Se abonó ${formatearMoneda(totalAbonado)}`}
        </p>
        <Feedback error={error} />

        <form className="entity-form" onSubmit={manejarEnvio}>
          <input type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} required />
          <CampoNumero value={valor} onChange={setValor} placeholder="Valor del pago" required />
          <textarea value={observaciones} onChange={(evento) => setObservaciones(evento.target.value)} placeholder="Observaciones (opcional)" rows="3" />
          <div className="modal-actions">
            <button type="button" onClick={onCerrar}>Cancelar</button>
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar pago'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalRegistrarMovimiento
