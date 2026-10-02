import { useState } from 'react'
import Inmuebles from './components/Inmuebles'
import Personas from './components/Personas'
import Arriendos from './components/Arriendos'
import Honorarios from './components/Honorarios'
import CuentasPorCobrar from './components/CuentasPorCobrar'
import Ventas from './components/Ventas'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('cuentas')

  return (
    <div className="app-shell">
      <header className="app-header"><div><p className="eyebrow">Panel administrativo</p><h1>Gestión de Negocio</h1></div></header>
      <nav className="app-nav">
      <button className={seccionActiva === 'personas' ? 'active' : ''} onClick={() => setSeccionActiva('personas')}>Clientes</button>
      <button className={seccionActiva === 'inmuebles' ? 'active' : ''} onClick={() => setSeccionActiva('inmuebles')}>Inmuebles</button>
      <button className={seccionActiva === 'ventas' ? 'active' : ''} onClick={() => setSeccionActiva('ventas')}>Ventas</button>
      <button className={seccionActiva === 'arriendos' ? 'active' : ''} onClick={() => setSeccionActiva('arriendos')}>Arriendos</button>
      <button className={seccionActiva === 'honorarios' ? 'active' : ''} onClick={() => setSeccionActiva('honorarios')}>Honorarios</button>
      <button className={seccionActiva === 'cuentas' ? 'active' : ''} onClick={() => setSeccionActiva('cuentas')}>Cuentas por cobrar</button>
      </nav>

      {seccionActiva === 'personas' && <Personas />}
      {seccionActiva === 'inmuebles' && <Inmuebles />}
      {seccionActiva === 'ventas' && <Ventas />}
      {seccionActiva === 'arriendos' && <Arriendos />}
      {seccionActiva === 'honorarios' && <Honorarios />}
      {seccionActiva === 'cuentas' && <CuentasPorCobrar />}
    </div>
  )

}

export default App
