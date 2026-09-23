import {useEffect, useState} from 'react'

function App() {
  const [personas, setPersonas] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/personas/')
      .then((response) => response.json())
      .then((data) => setPersonas(data))
  }, [])

  return (
    <div>
      <h1>Personas</h1>
      <ul>
        {personas.map((persona) => (
          <li key={persona.id}> {persona.nombre} - {persona.cedula} </li>
        ))}
      </ul>
    </div>
  )
}

export default App