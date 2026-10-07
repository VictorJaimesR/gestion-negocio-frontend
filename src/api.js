const BASE_URL = import.meta.env.VITE_API_URL

export function apiFetch(ruta, opciones = {}) {
  const token = localStorage.getItem('token')

  const encabezados = {
    'Content-Type': 'application/json',
    ...opciones.headers,
  }

  if (token) {
    encabezados['Authorization'] = `Token ${token}`
  }

  return fetch(`${BASE_URL}${ruta}`, {
    ...opciones,
    headers: encabezados,
  })
}

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

export default apiFetch