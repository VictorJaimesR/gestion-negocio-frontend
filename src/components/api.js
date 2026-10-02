export async function leerRespuesta(response, mensaje = 'No se pudo completar la operación') {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const detalles = typeof data === 'string'
      ? data
      : Object.values(data).flat().join(' ')
    throw new Error(detalles || `${mensaje} (${response.status})`)
  }

  return data
}