import { useState } from 'react'
import { apiFetch, leerRespuesta } from '../api'
import CampoNumero from './CampoNumero'

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

function ModalRegistrarMovimiento({ tipo, idRelacionado, etiqueta, onCerrar, onRegistrado }) {
  const [fecha, setFecha] = useState(fechaHoy)
  const [valor, setValor] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)

  function manejarEnvio(evento) {
    evento.preventDefault()
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
        onRegistrado()
        onCerrar()
      })
      .catch((error) => window.alert(error.message))
      .finally(() => setGuardando(false))
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movimiento-titulo"
      style={{position: 'fixed', inset: 0, zIndex: 10, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(24, 43, 43, 0.48)'}}
    >
      <div
        className="modal-content"
        style={{width: 'min(100%, 560px)', maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto', padding: '1.5rem', borderRadius: '12px', background: '#ffffff', boxShadow: '0 18px 50px rgba(24, 43, 43, 0.24)'}}
      >
        <div className="view-heading">
          <div>
            <p className="eyebrow">Registro financiero</p>
            <h2 id="modal-movimiento-titulo">{etiquetasTipo[tipo]}</h2>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{width: '32px', height: '32px', padding: 0, border: '1px solid #d5dfdf', borderRadius: '5px', background: '#ffffff', color: '#5d7999', cursor: 'pointer', fontSize: '1.35rem', lineHeight: 1}}>×</button>
        </div>
        <p style={{margin: '0 0 0.25rem', color: '#5d7999', fontSize: '0.8rem', fontWeight: 700}}>Qué se está pagando</p>
        <p style={{margin: '0 0 1rem', color: '#243b3b', fontWeight: 600}}>{etiqueta}</p>

        <form className="entity-form" onSubmit={manejarEnvio}>
          <input type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} required />
          <CampoNumero value={valor} onChange={setValor} placeholder="Valor del pago" required />
          <textarea value={observaciones} onChange={(evento) => setObservaciones(evento.target.value)} placeholder="Observaciones (opcional)" rows="3" />
          <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'flex-end'}}>
            <button type="button" onClick={onCerrar}>Cancelar</button>
            <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar pago'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalRegistrarMovimiento
