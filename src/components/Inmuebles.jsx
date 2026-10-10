import {useState, useEffect} from 'react';
import { AccionesTabla } from './AccionesTabla';
import { apiFetch, leerRespuesta } from '../api';
import { cachedGet, getCachedData, invalidateCache } from '../dataCache';
import { Feedback } from './Feedback'
import { Plus } from 'lucide-react'

function Inmuebles() {
    const [inmuebles, setInmuebles] = useState(() => getCachedData('/inmuebles/') || []);
    const [tipo, setTipo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState('disponible');
    const [inmuebleEditando, setInmuebleEditando] = useState(null);
    const [formularioAbierto, setFormularioAbierto] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        cargarInmuebles();
    }, []);

    function cargarInmuebles() {
        cachedGet('/inmuebles/', 'No se pudieron cargar los inmuebles')
            .then((data) => setInmuebles(data));
    }

    function manejarEnvio(evento) {
        evento.preventDefault();
        setError('');
        setSuccess('');

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
            invalidateCache('/inmuebles/', '/ventas/', '/arriendos/', '/movimientos/');
            cargarInmuebles();
            setSuccess(inmuebleEditando ? 'Activo actualizado correctamente.' : 'Activo agregado correctamente.');
        })
        .catch((error) => {
            setError(error.message);
        });
    }

    function limpiarFormulario() {
        setTipo('');
        setDescripcion('');
        setEstado('disponible');
        setInmuebleEditando(null);
        setFormularioAbierto(false);
    }

    function editarInmueble(inmueble) {
        setFormularioAbierto(true);
        setInmuebleEditando(inmueble.id);
        setTipo(inmueble.tipo);
        setDescripcion(inmueble.descripcion);
        setEstado(inmueble.estado);
    }

    function eliminarInmueble(id) {
        if (!window.confirm('¿Seguro que deseas eliminar este inmueble?')) return;
        apiFetch(`/inmuebles/${id}/`, {method: 'DELETE'})
            .then((response) => leerRespuesta(response, 'No se pudo eliminar el inmueble'))
            .then(() => {
                invalidateCache('/inmuebles/', '/ventas/', '/arriendos/', '/movimientos/');
                cargarInmuebles();
            })
            .catch((error) => setError(error.message));
    }

    return (
        <section className="app-view">
            <div className="view-heading"><div><p className="eyebrow">Inventario</p><h2>Activos</h2><p className="view-subtitle">Consulta y administra los activos disponibles del negocio.</p></div><span className="view-badge">{inmuebles.length} Activos</span></div>
            <Feedback error={error} success={success} />

            {!formularioAbierto && <button type="button" className="add-record-button" onClick={() => setFormularioAbierto(true)}><Plus size={18} strokeWidth={2.2} aria-hidden="true" /> Agregar activo</button>}
            {formularioAbierto && <form className="entity-form" onSubmit={manejarEnvio}>
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
            </form>}
            
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
                            <td data-label="Tipo">{inmueble.tipo}</td>
                            <td data-label="Descripción">{inmueble.descripcion}</td>
                            <td data-label="Estado">{inmueble.estado}</td>
                            <td data-label="Acciones">
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