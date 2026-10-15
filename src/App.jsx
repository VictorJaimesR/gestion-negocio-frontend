import { useEffect, useRef, useState } from 'react'
import Login from './components/Login'
import Registro from './components/Registro'
import Inmuebles from './components/Inmuebles'
import Personas from './components/Personas'
import Arriendos from './components/Arriendos'
import Honorarios from './components/Honorarios'
import CuentasPorCobrar from './components/CuentasPorCobrar'
import Ventas from './components/Ventas'
import Movimientos from './components/Movimientos'
import { clearCache } from './dataCache'
import { Clock3, Menu, UserRound, X } from 'lucide-react'

function BienvenidaDemo({ alCerrar, alCrearUsuario, botonCerrarRef }) {
  return (
    <div
      className="modal-overlay demo-welcome-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) alCerrar()
      }}
    >
      <section
        className="modal-content demo-welcome"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-welcome-title"
        aria-describedby="demo-welcome-description"
      >
        <button
          ref={botonCerrarRef}
          type="button"
          className="modal-close demo-welcome-close"
          aria-label="Cerrar bienvenida"
          onClick={alCerrar}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="demo-welcome-icon" aria-hidden="true">
          <span className="demo-welcome-mark">GN</span>
        </div>
        <p className="demo-welcome-label">Demo de Gestión de Negocio</p>
        <h2 id="demo-welcome-title">¡Te damos la bienvenida!</h2>
        <p id="demo-welcome-description" className="demo-welcome-description">
          Prueba la plataforma creando tu propio usuario. Desde allí podrás explorar
          las herramientas para organizar clientes, activos, ventas, arriendos,
          honorarios, cuentas por cobrar y movimientos de tu negocio.
        </p>

        <div className="demo-welcome-note" role="note">
          <Clock3 size={21} aria-hidden="true" />
          <p>
            La demo funciona en plataformas gratuitas que pueden poner sus servicios
            en reposo. Por eso, el primer registro o inicio de sesión puede tardar
            alrededor de un minuto. Espera a que termine la carga.
          </p>
        </div>

        <div className="demo-welcome-actions">
          <button type="button" className="demo-welcome-secondary" onClick={alCerrar}>
            Ir al inicio de sesión
          </button>
          <button type="button" className="demo-welcome-primary" onClick={alCrearUsuario}>
            Crear usuario
          </button>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [vistaAuth, setVistaAuth] = useState('login')
  const [seccionActiva, setSeccionActiva] = useState('cuentas')
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [bienvenidaAbierta, setBienvenidaAbierta] = useState(true)
  const botonCerrarBienvenidaRef = useRef(null)

  useEffect(() => {
    if (token || !bienvenidaAbierta) return undefined

    botonCerrarBienvenidaRef.current?.focus()
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') setBienvenidaAbierta(false)
    }

    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [bienvenidaAbierta, token])

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

  function iniciarSesion(nuevoToken) {
    clearCache()
    setMenuUsuarioAbierto(false)
    setSeccionActiva('cuentas')
    setToken(nuevoToken)
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    clearCache()
    setMenuUsuarioAbierto(false)
    setMenuMovilAbierto(false)
    setSeccionActiva('cuentas')
    setVistaAuth('login')
    setToken(null)
  }

  if (!token) {
    return (
      <>
        {vistaAuth === 'registro'
          ? <Registro alCompletarRegistro={iniciarSesion} alVolver={() => setVistaAuth('login')} />
          : <Login alIniciarSesion={iniciarSesion} alIrARegistro={() => setVistaAuth('registro')} />}
        {bienvenidaAbierta && (
          <BienvenidaDemo
            botonCerrarRef={botonCerrarBienvenidaRef}
            alCerrar={() => setBienvenidaAbierta(false)}
            alCrearUsuario={() => {
              setVistaAuth('registro')
              setBienvenidaAbierta(false)
            }}
          />
        )}
      </>
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
