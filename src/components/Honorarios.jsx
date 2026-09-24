import { useState, useEffect } from 'react'

function Honorarios() {
  const [honorarios, setHonorarios] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/honorarios/')
      .then((response) => response.json())
      .then((data) => setHonorarios(data))
  }, [])

  return (
    <div>
      <h2>Honorarios</h2>
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Concepto</th>
            <th>Valor</th>
            <th>Vencimiento</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {honorarios.map((honorario) => (
            <tr key={honorario.id}>
              <td>{honorario.cliente}</td>
              <td>{honorario.concepto}</td>
              <td>{honorario.valor_honorario}</td>
              <td>{honorario.fecha_vencimiento}</td>
              <td>{honorario.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Honorarios