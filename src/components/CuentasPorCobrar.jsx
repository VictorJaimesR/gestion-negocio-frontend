import { useState, useEffect } from 'react'

function CuentasPorCobrar() {
  const [totales, setTotales] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/cuentas-por-cobrar/')
      .then((response) => response.json())
      .then((data) => setTotales(data))
  }, [])

  if (!totales) {
    return <p>Cargando...</p>
  }

  return (
    <div>
      <h2>Cuentas por Cobrar</h2>
      <ul>
        <li>Total ventas pendientes: ${totales.total_ventas}</li>
        <li>Total arriendos pendientes: ${totales.total_arriendos}</li>
        <li>Total honorarios pendientes: ${totales.total_honorarios}</li>
      </ul>
      <h3>Total general: ${totales.total_general}</h3>
    </div>
  )
}

export default CuentasPorCobrar