import { useState, useEffect } from 'react'

function Arriendos() {
  const [arriendos, setArriendos] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/arriendos/')
      .then((response) => response.json())
      .then((data) => setArriendos(data))
  }, [])

  return (
    <div>
      <h2>Arriendos</h2>
      <table>
        <thead>
          <tr>
            <th>Inmueble</th>
            <th>Arrendatario</th>
            <th>Canon Mensual</th>
            <th>Día de Pago</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {arriendos.map((arriendo) => (
            <tr key={arriendo.id}>
              <td>{arriendo.inmueble}</td>
              <td>{arriendo.arrendatario}</td>
              <td>{arriendo.canon_mensual}</td>
              <td>{arriendo.dia_pago}</td>
              <td>{arriendo.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Arriendos