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

  function cerrarSesion() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return <Login alIniciarSesion={(nuevoToken) => setToken(nuevoToken)} /> 
  }

  return (
    <div className="app-shell">
      <header className="app-header"><div><p className="eyebrow">Panel administrativo</p><h1>Gestión de Negocio</h1></div></header>
      <nav className="app-nav">
      <button className={seccionActiva === 'cuentas' ? 'active' : ''} onClick={() => setSeccionActiva('cuentas')}>Cuentas por cobrar</button>
      <button className={seccionActiva === 'personas' ? 'active' : ''} onClick={() => setSeccionActiva('personas')}>Clientes</button>
      <button className={seccionActiva === 'inmuebles' ? 'active' : ''} onClick={() => setSeccionActiva('inmuebles')}>Inmuebles</button>
      <button className={seccionActiva === 'ventas' ? 'active' : ''} onClick={() => setSeccionActiva('ventas')}>Ventas</button>
      <button className={seccionActiva === 'arriendos' ? 'active' : ''} onClick={() => setSeccionActiva('arriendos')}>Arriendos</button>
      <button className={seccionActiva === 'honorarios' ? 'active' : ''} onClick={() => setSeccionActiva('honorarios')}>Honorarios</button>
      <button className={seccionActiva === 'movimientos' ? 'active' : ''} onClick={() => setSeccionActiva('movimientos')}>Movimientos</button>
      <button type="button" onClick={cerrarSesion}>Cerrar sesión</button>

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
