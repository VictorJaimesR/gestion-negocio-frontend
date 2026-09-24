import { useState, useEffect } from 'react'

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [ventaExpandida, setVentaExpandida] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/ventas/')
      .then((response) => response.json())
      .then((data) => setVentas(data))
  }, [])

  function alternarExpandir(id) {
    if (ventaExpandida === id) {
      setVentaExpandida(null)
    } else {
      setVentaExpandida(id)
    }
  }

  return (
    <div>
      <h2>Ventas</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Inmueble</th>
            <th>Comprador</th>
            <th>Fecha</th>
            <th>Precio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <>
              <tr key={venta.id}>
                <td>
                  <button onClick={() => alternarExpandir(venta.id)}>
                    {ventaExpandida === venta.id ? '−' : '+'}
                  </button>
                </td>
                <td>{venta.inmueble}</td>
                <td>{venta.comprador}</td>
                <td>{venta.fecha_venta}</td>
                <td>{venta.precio_venta}</td>
                <td>{venta.estado}</td>
              </tr>

              {ventaExpandida === venta.id && venta.financiamiento && (
                <tr>
                  <td colSpan="6">
                    <strong>Financiamiento</strong>
                    <p>
                      Pago inicial: {venta.financiamiento.pago_inicial} |
                      Capital financiado: {venta.financiamiento.capital_financiado} |
                      {venta.financiamiento.numero_cuotas} cuotas de {venta.financiamiento.valor_cuota}
                    </p>

                    <table>
                      <thead>
                        <tr>
                          <th>Cuota #</th>
                          <th>Vencimiento</th>
                          <th>Valor</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venta.financiamiento.cuotas.map((cuota) => (
                          <tr key={cuota.id}>
                            <td>{cuota.numero_cuota}</td>
                            <td>{cuota.fecha_vencimiento}</td>
                            <td>{cuota.valor_cuota}</td>
                            <td>{cuota.estado}</td>
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

export default Ventas