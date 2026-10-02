export function AccionesTabla({ onEditar, onEliminar }) {
  return (
    <div className="acciones-tabla">
      <button type="button" className="accion-editar" onClick={onEditar} aria-label="Editar" title="Editar">
        ✎
      </button>
      <button type="button" className="accion-eliminar" onClick={onEliminar} aria-label="Eliminar" title="Eliminar">
        🗑
      </button>
    </div>
  )
}
