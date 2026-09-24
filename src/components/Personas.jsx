import {useEffect, useState} from 'react'

function Personas() {
  const [personas, setPersonas] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/personas/')
      .then((response) => response.json())
      .then((data) => setPersonas(data))
  }, [])

  return (
    <div>
      <h2>Personas</h2>
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                </tr>
            </thead>
            <tbody>
                {personas.map((persona) => (
                    <tr key={persona.id}>
                        <td>{persona.nombre}</td>
                        <td>{persona.cedula}</td>
                        <td>{persona.telefono}</td>
                        <td>{persona.correo}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}

export default Personas