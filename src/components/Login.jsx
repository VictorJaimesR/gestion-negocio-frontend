import { useState } from 'react'

function Login({ alIniciarSesion }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')

    fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Credenciales incorrectas')
        }
        return response.json()
      })
      .then((data) => {
        localStorage.setItem('token', data.token)
        alIniciarSesion(data.token)
      })
      .catch(() => {
        setError('Usuario o contraseña incorrectos')
      })
  }

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={manejarEnvio}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default Login