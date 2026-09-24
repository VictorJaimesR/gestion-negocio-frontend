import { useState } from 'react'
import Inmuebles from './components/Inmuebles'
import Personas from './components/Personas'
import Arriendos from './components/Arriendos'
import Honorarios from './components/Honorarios'
import CuentasPorCobrar from './components/CuentasPorCobrar'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('cuentas')

  return (
    <div>
      <h1>Gestión de Negocio</h1>
      <nav>
      <button onClick={() => setSeccionActiva('personas')}>Personas</button>
      <button onClick={() => setSeccionActiva('inmuebles')}>Inmuebles</button>
      <button onClick={() => setSeccionActiva('arriendos')}>Arriendos</button>
      <button onClick={() => setSeccionActiva('honorarios')}>Honorarios</button>
      <button onClick={() => setSeccionActiva('cuentas')}>Cuentas por Cobrar</button>
      </nav>

      {seccionActiva === 'personas' && <Personas />}
      {seccionActiva === 'inmuebles' && <Inmuebles />}
      {seccionActiva === 'arriendos' && <Arriendos />}
      {seccionActiva === 'honorarios' && <Honorarios />}
      {seccionActiva === 'cuentas' && <CuentasPorCobrar />}
    </div>
  )

}

export default App
