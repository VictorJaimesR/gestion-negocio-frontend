import { useState } from 'react'
import Login from './components/Login'
import Inmuebles from './components/Inmuebles'
import Personas from './components/Personas'
import Arriendos from './components/Arriendos'
import Honorarios from './components/Honorarios'
import CuentasPorCobrar from './components/CuentasPorCobrar'
import Ventas from './components/Ventas'
import Movimientos from './components/Movimientos'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [seccionActiva, setSeccionActiva] = useState('cuentas')
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)

  function cerrarSesion() {
    localStorage.removeItem('token')
    setMenuUsuarioAbierto(false)
    setToken(null)
  }

  if (!token) {
    return (
      <Login
        alIniciarSesion={(nuevoToken) => {
          setMenuUsuarioAbierto(false)
          setToken(nuevoToken)
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Panel administrativo</p>
          <h1>Gestión de Negocio</h1>
        </div>
        <div className="user-menu">
          <button
            type="button"
            className="user-menu-trigger"
            onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
            aria-label="Abrir menú de usuario"
            aria-expanded={menuUsuarioAbierto}
            title="Menú de usuario"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
            </svg>
          </button>
          {menuUsuarioAbierto && (
            <div className="user-menu-dropdown">
              <button type="button" onClick={() => setMenuUsuarioAbierto(false)}>
                Editar usuario
              </button>
              <button type="button" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>
      <nav className="app-nav">
      <button className={seccionActiva === 'cuentas' ? 'active' : ''} onClick={() => setSeccionActiva('cuentas')}>Cuentas por cobrar</button>
      <button className={seccionActiva === 'personas' ? 'active' : ''} onClick={() => setSeccionActiva('personas')}>Clientes</button>
      <button className={seccionActiva === 'inmuebles' ? 'active' : ''} onClick={() => setSeccionActiva('inmuebles')}>Inmuebles</button>
      <button className={seccionActiva === 'ventas' ? 'active' : ''} onClick={() => setSeccionActiva('ventas')}>Ventas</button>
      <button className={seccionActiva === 'arriendos' ? 'active' : ''} onClick={() => setSeccionActiva('arriendos')}>Arriendos</button>
      <button className={seccionActiva === 'honorarios' ? 'active' : ''} onClick={() => setSeccionActiva('honorarios')}>Honorarios</button>
      <button className={seccionActiva === 'movimientos' ? 'active' : ''} onClick={() => setSeccionActiva('movimientos')}>Movimientos</button>
      </nav>

      {seccionActiva === 'personas' && <Personas />}
      {seccionActiva === 'inmuebles' && <Inmuebles />}
      {seccionActiva === 'ventas' && <Ventas />}
      {seccionActiva === 'arriendos' && <Arriendos />}
      {seccionActiva === 'honorarios' && <Honorarios />}
      {seccionActiva === 'cuentas' && <CuentasPorCobrar />}
      {seccionActiva === 'movimientos' && <Movimientos />}
    </div>
  )

}

export default App
