import { useState } from 'react'
import Login from './components/Login'
import Inmuebles from './components/Inmuebles'
import Personas from './components/Personas'
import Arriendos from './components/Arriendos'
import Honorarios from './components/Honorarios'
import CuentasPorCobrar from './components/CuentasPorCobrar'
import Ventas from './components/Ventas'
import Movimientos from './components/Movimientos'
import { clearCache } from './dataCache'
import { Menu, UserRound, X } from 'lucide-react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [seccionActiva, setSeccionActiva] = useState('cuentas')
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  const opcionesNavegacion = [
    ['cuentas', 'Cuentas por cobrar'],
    ['personas', 'Clientes'],
    ['inmuebles', 'Activos'],
    ['ventas', 'Ventas'],
    ['arriendos', 'Arriendos'],
    ['honorarios', 'Honorarios'],
    ['movimientos', 'Movimientos'],
  ]

  function cambiarSeccion(seccion) {
    setSeccionActiva(seccion)
    setMenuMovilAbierto(false)
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    clearCache()
    setMenuUsuarioAbierto(false)
    setMenuMovilAbierto(false)
    setSeccionActiva('cuentas')
    setToken(null)
  }

  if (!token) {
    return (
      <Login
        alIniciarSesion={(nuevoToken) => {
          clearCache()
          setMenuUsuarioAbierto(false)
          setSeccionActiva('cuentas')
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
            <UserRound size={22} strokeWidth={1.8} aria-hidden="true" />
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
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
        aria-expanded={menuMovilAbierto}
        aria-controls="mobile-navigation"
      >
        <span>{opcionesNavegacion.find(([id]) => id === seccionActiva)?.[1]}</span>
        {menuMovilAbierto
          ? <X size={20} strokeWidth={2} aria-hidden="true" />
          : <Menu size={20} strokeWidth={2} aria-hidden="true" />}
      </button>
      {menuMovilAbierto && (
        <div id="mobile-navigation" className="mobile-nav-menu">
          <p className="mobile-nav-title">Navegación</p>
          {opcionesNavegacion.map(([id, etiqueta]) => (
            <button
              type="button"
              key={id}
              className={seccionActiva === id ? 'active' : ''}
              onClick={() => cambiarSeccion(id)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      )}
      <nav className="app-nav">
        {opcionesNavegacion.map(([id, etiqueta]) => (
          <button type="button" key={id} className={seccionActiva === id ? 'active' : ''} onClick={() => cambiarSeccion(id)}>
            {etiqueta}
          </button>
        ))}
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
