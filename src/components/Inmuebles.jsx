import {useState, useEffect} from 'react';
import { AccionesTabla } from './AccionesTabla';
import { apiFetch, leerRespuesta } from '../api';

function Inmuebles() {
    const [inmuebles, setInmuebles] = useState([]);
    const [tipo, setTipo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState('disponible');
    const [inmuebleEditando, setInmuebleEditando] = useState(null);

    useEffect(() => {
        cargarInmuebles();
    }, []);

    function cargarInmuebles() {
        apiFetch('/inmuebles/')
            .then((response) => leerRespuesta(response, 'No se pudieron cargar los inmuebles'))
            .then((data) => setInmuebles(data));
    }

    function manejarEnvio(evento) {
        evento.preventDefault();

        const nuevoInmueble = {
            tipo: tipo,
            descripcion: descripcion,
            estado: inmuebleEditando ? estado : 'disponible'
        };

        apiFetch(inmuebleEditando ? `/inmuebles/${inmuebleEditando}/` : '/inmuebles/', {
            method: inmuebleEditando ? 'PUT' : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nuevoInmueble),
        })
        .then((response) => leerRespuesta(response, 'No se pudo guardar el inmueble'))
        .then(() => {
            limpiarFormulario();
            cargarInmuebles();
        })
        .catch((error) => {
            window.alert(error.message);
        });
    }

    function limpiarFormulario() {
        setTipo('');
        setDescripcion('');
        setEstado('disponible');
        setInmuebleEditando(null);
    }

    function editarInmueble(inmueble) {
        setInmuebleEditando(inmueble.id);
        setTipo(inmueble.tipo);
        setDescripcion(inmueble.descripcion);
        setEstado(inmueble.estado);
    }

    function eliminarInmueble(id) {
        if (!window.confirm('¿Seguro que deseas eliminar este inmueble?')) return;
        apiFetch(`/inmuebles/${id}/`, {method: 'DELETE'})
            .then((response) => leerRespuesta(response, 'No se pudo eliminar el inmueble'))
            .then(() => cargarInmuebles())
            .catch((error) => window.alert(error.message));
    }

    return (
        <section className="app-view">
            <div className="view-heading"><div><p className="eyebrow">Inventario</p><h2>Activos</h2><p className="view-subtitle">Consulta y administra los activos disponibles del negocio.</p></div><span className="view-badge">{inmuebles.length} Activos</span></div>

            <form className="entity-form" onSubmit={manejarEnvio}>
                <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required
                >
                    <option value="">Seleccione un tipo</option>
                    <option value="vehiculo">Vehículo</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="motocicleta">Motocicleta</option>
                    <option value="lote">Lote</option>
                    <option value="otro">Otro</option>
                </select>
                <input 
                    type="text"
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                />
                <button type="submit">{inmuebleEditando ? 'Actualizar Inmueble' : 'Agregar Activo'}</button>
                {inmuebleEditando && <button type="button" onClick={limpiarFormulario}>Cancelar</button>}
            </form>
            
            <div className="table-wrap"><table className="data-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {inmuebles.map((inmueble) => (
                        <tr key={inmueble.id}>
                            <td>{inmueble.tipo}</td>
                            <td>{inmueble.descripcion}</td>
                            <td>{inmueble.estado}</td>
                            <td>
                                <AccionesTabla
                                    onEditar={() => editarInmueble(inmueble)}
                                    onEliminar={() => eliminarInmueble(inmueble.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table></div>
        </section>
    );
}

export default Inmuebles;