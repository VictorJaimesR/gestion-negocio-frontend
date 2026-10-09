import { useState } from 'react'

function Login({ alIniciarSesion }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [iniciandoSesion, setIniciandoSesion] = useState(false)

  function manejarEnvio(evento) {
    evento.preventDefault()
    if (iniciandoSesion) return
    setError('')
    setIniciandoSesion(true)

    fetch(`${import.meta.env.VITE_API_URL}/login/`, {
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
      .finally(() => {
        setIniciandoSesion(false)
      })
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-mark">GN</div>
          <div>
            <p className="eyebrow">Panel administrativo</p>
            <span className="login-brand-name">Gestión de Negocio</span>
          </div>
        </div>
        <div className="login-heading">
          <h2>Bienvenido</h2>
          <p>Ingresa a tu cuenta para continuar administrando tu negocio.</p>
        </div>
        <form className="login-form" onSubmit={manejarEnvio}>
          <label>
            Usuario
            <input
              type="text"
              placeholder="Escribe tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={iniciandoSesion}>
            {iniciandoSesion ? 'Verificando credenciales...' : 'Iniciar sesión'}
          </button>
        </form>
        {error && <p className="login-error" role="alert">{error}</p>}
        <p className="login-footer">Acceso seguro para tu equipo</p>
      </section>
    </main>
  )
}

export default Login