import { Pencil, Trash2 } from 'lucide-react'

export function AccionesTabla({ onEditar, onEliminar }) {
  return (
    <div className="acciones-tabla">
      <button type="button" className="accion-editar" onClick={onEditar} aria-label="Editar" title="Editar">
        <Pencil size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <button type="button" className="accion-eliminar" onClick={onEliminar} aria-label="Eliminar" title="Eliminar">
        <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
