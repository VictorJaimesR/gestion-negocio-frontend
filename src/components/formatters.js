const separadorMiles = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 2,
})

export function formatearNumero(valor) {
  if (valor === '' || valor === null || valor === undefined) return ''
  return separadorMiles.format(Number(valor) || 0)
}

export function limpiarNumero(valor) {
  return valor.replace(/\./g, '').replace(',', '.')
}

export function formatearMoneda(valor) {
  return `$ ${separadorMiles.format(Number(valor) || 0)}`
}

export function formatearFecha(valor) {
  if (!valor) return 'Sin fecha'
  const [anio, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${anio}`
}
