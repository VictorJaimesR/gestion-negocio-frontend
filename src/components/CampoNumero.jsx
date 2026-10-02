import { formatearNumero, limpiarNumero } from './formatters'

function CampoNumero({value, onChange, placeholder, min = '0', readOnly = false, required = false}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={formatearNumero(value)}
      onChange={(evento) => {
        const valor = limpiarNumero(evento.target.value.replace(/[^\d,.-]/g, ''))
        onChange(valor)
      }}
      placeholder={placeholder}
      min={min}
      readOnly={readOnly}
      required={required}
    />
  )
}

export default CampoNumero
