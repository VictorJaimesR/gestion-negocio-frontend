import {useState, useEffect} from 'react';

function Inmuebles() {
    const [inmuebles, setInmuebles] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/inmuebles/')
            .then((response) => response.json())
            .then((data) => setInmuebles(data));
    }, []);

    return (
        <div>
            <h2>Inmuebles</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {inmuebles.map((inmueble) => (
                        <tr key={inmueble.id}>
                            <td>{inmueble.tipo}</td>
                            <td>{inmueble.descripcion}</td>
                            <td>{inmueble.estado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Inmuebles;