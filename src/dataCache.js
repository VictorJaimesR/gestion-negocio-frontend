import { apiFetch, leerRespuesta } from './api'

const cache = new Map()
const requestsInFlight = new Map()

export function getCachedData(ruta) {
  return cache.get(ruta)
}

export function cachedGet(ruta, mensaje, {force = false} = {}) {
  if (!force && cache.has(ruta)) {
    return Promise.resolve(cache.get(ruta))
  }

  if (requestsInFlight.has(ruta)) {
    return requestsInFlight.get(ruta)
  }

  const request = apiFetch(ruta)
    .then((response) => leerRespuesta(response, mensaje))
    .then((data) => {
      cache.set(ruta, data)
      return data
    })
    .finally(() => {
      requestsInFlight.delete(ruta)
    })

  requestsInFlight.set(ruta, request)
  return request
}

export function invalidateCache(...rutas) {
  rutas.forEach((ruta) => cache.delete(ruta))
}

export function clearCache() {
  cache.clear()
}
