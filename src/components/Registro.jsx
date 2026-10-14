import { useRef, useState } from 'react'

function Registro({ alCompletarRegistro, alVolver }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const emailInputRef = useRef(null)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [registrando, setRegistrando] = useState(false)

  async function manejarEnvio(evento) {
    evento.preventDefault()
    if (registrando) return
    setError('')

    if (!username.trim()) {
      setError('Escribe el nombre de usuario que quieres usar.')
      return
    }

    if (!email.trim()) {
      setError('Escribe tu correo electrónico.')
      emailInputRef.current?.focus()
      return
    }

    if (!password) {
      setError('Crea una contraseña para tu cuenta.')
      return
    }

    if (!passwordConfirmation) {
      setError('Confirma tu contraseña.')
      return
    }

    if (emailInputRef.current && !emailInputRef.current.validity.valid) {
      setError('Escribe un correo válido, por ejemplo nombre@dominio.com.')
      emailInputRef.current.focus()
      return
    }

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setRegistrando(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        }),
      })
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(
          'El servidor devolvió una página en lugar de la API. Verifica que el backend esté actualizado y que VITE_API_URL apunte a la API (por ejemplo, termine en /api).',
        )
      }

      const data = await response.json()
      if (!response.ok) {
        const detalles = typeof data === 'object' && data !== null
          ? Object.values(data).flat().join(' ')
          : data
        throw new Error(detalles || 'No se pudo crear la cuenta.')
      }

      localStorage.setItem('token', data.token)
      alCompletarRegistro(data.token)
    } catch (errorRegistro) {
      setError(errorRegistro.message || 'No se pudo completar el registro.')
    } finally {
      setRegistrando(false)
    }
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
          <h2>Crear cuenta</h2>
          <p>Registra tu usuario para comenzar a administrar tu negocio.</p>
        </div>
        <form className="login-form" noValidate onSubmit={manejarEnvio}>
          <label>
            Usuario
            <input
              type="text"
              autoComplete="username"
              placeholder="Elige un nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Correo electrónico
            <input
              ref={emailInputRef}
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Crea una contraseña segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirmar contraseña
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Escribe de nuevo tu contraseña"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={registrando}>
            {registrando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        {error && <p className="login-error" role="alert">{error}</p>}
        <p className="register-switch">
          ¿Ya tienes una cuenta?{' '}
          <button type="button" onClick={alVolver}>Inicia sesión</button>
        </p>
      </section>
    </main>
  )
}

export default Registro