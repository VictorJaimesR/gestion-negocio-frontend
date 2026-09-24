import { useState, useEffect } from 'react'

function Arriendos() {
  const [arriendos, setArriendos] = useState([])
  const [arriendoExpandido, setArriendoExpandido] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/arriendos/')
      .then((response) => response.json())
      .then((data) => setArriendos(data))
  }, [])

  function alternarExpandir(id) {
    if (arriendoExpandido === id) {
      setArriendoExpandido(null)
    } else {
      setArriendoExpandido(id)
    }
  }

  return (
    <div>
      <h2>Arriendos</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Inmueble</th>
            <th>Arrendatario</th>
            <th>Canon Mensual</th>
            <th>Día de Pago</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {arriendos.map((arriendo) => (
            <>
              <tr key={arriendo.id}>
                <td>
                  <button onClick={() => alternarExpandir(arriendo.id)}>
                    {arriendoExpandido === arriendo.id ? '−' : '+'}
                  </button>
                </td>
                <td>{arriendo.inmueble}</td>
                <td>{arriendo.arrendatario}</td>
                <td>{arriendo.canon_mensual}</td>
                <td>{arriendo.dia_pago}</td>
                <td>{arriendo.estado}</td>
              </tr>

              {arriendoExpandido === arriendo.id && (
                <tr>
                  <td colSpan="6">
                    <strong>Obligaciones</strong>
                    <table>
                      <thead>
                        <tr>
                          <th>Periodo</th>
                          <th>Vencimiento</th>
                          <th>Valor</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arriendo.obligaciones.map((obligacion) => (
                          <tr key={obligacion.id}>
                            <td>{obligacion.periodo}</td>
                            <td>{obligacion.fecha_vencimiento}</td>
                            <td>{obligacion.valor_obligacion}</td>
                            <td>{obligacion.estado}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Arriendos