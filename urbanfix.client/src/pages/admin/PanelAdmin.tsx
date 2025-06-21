// Importaciones
import { useEffect, useState } from "react";
import axios from "axios";
import "../../fix-leaflet-icon";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; 

// Ícono personalizado
const customIcon = new L.Icon({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Interfaces
interface Reporte {
    id: number;
    descripcion: string;
    categoria: string;
    fecha: string;
    estado: string;
    usuarioId: number;
    imagenUrl?: string;
    comentarios?: Comentario[];
    latitud?: number;
    longitud?: number;
    asignado?: boolean;
}

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

interface Comentario {
    id: number;
    contenido: string;
    fecha: string;
    autor: string;
}

export default function PanelAdmin() {
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
    const [asignandoId, setAsignandoId] = useState<number | null>(null);
    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<number>(0);
    const [comentarios, setComentarios] = useState<{ [key: number]: Comentario[] }>({});
    const [comentariosVisibles, setComentariosVisibles] = useState<{ [key: number]: boolean }>({});

    const [nuevoComentario, setNuevoComentario] = useState<{ [key: number]: string }>({});
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [coordenadasReportes, setCoordenadasReportes] = useState<Reporte[]>([]);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const token = localStorage.getItem("token");
    const tokenPayload = token ? JSON.parse(atob(token.split(".")[1])) : null;

    useEffect(() => {
        obtenerReportes();
        axios
            .get("https://localhost:7281/api/reportes", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setReportes(res.data);
                setCoordenadasReportes(res.data);
            });

        axios
            .get("https://localhost:7281/api/usuarios", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const tecnicosFiltrados = res.data.filter((u: Usuario) => u.rol === "Tecnico");
                setTecnicos(tecnicosFiltrados);
            });
    }, []);

    const obtenerReportes = () => {
        axios
            .get("https://localhost:7281/api/reportes", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setReportes(res.data);
                setCoordenadasReportes(res.data);
            });
    };


    const asignarTecnico = (reporteId: number) => {
        if (tecnicoSeleccionado === 0) return;
        axios.post("https://localhost:7281/api/asignaciones", {
            reporteId,
            tecnicoId: tecnicoSeleccionado,
            fechaAsignacion: new Date().toISOString()
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            alert("Asignación exitosa");
            setAsignandoId(null);
            obtenerReportes();
        });
    };

    const cargarComentarios = async (reporteId: number) => {
        try {
            const res = await axios.get(`https://localhost:7281/api/comentarios/por-reporte/${reporteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComentarios((prev) => ({ ...prev, [reporteId]: res.data }));
        } catch (err) {
            console.error("Error al obtener comentarios", err);
        }
    };

    const enviarComentario = async (reporteId: number) => {
        const contenido = nuevoComentario[reporteId];
        if (!contenido) return;

        const usuarioId = tokenPayload
            ? parseInt(tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"])
            : 0;

        try {
            await axios.post("https://localhost:7281/api/comentarios", {
                contenido,
                usuarioId,
                reporteId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNuevoComentario((prev) => ({ ...prev, [reporteId]: "" }));
            cargarComentarios(reporteId);
        } catch (err) {
            alert("No se pudo agregar el comentario");
        }
    };

    // Clasificación de reportes
    const noAsignados = reportes.filter(r => !r.asignado && r.estado === "Pendiente");
    const asignados = reportes.filter(r => r.asignado && r.estado !== "Resuelto");
    const resueltos = reportes.filter(r => r.estado === "Resuelto");

    return (
        <div className="admin-container">

            <Navbar titulo="Panel de Administración" />

            <button onClick={() => setMostrarMapa(!mostrarMapa)} className="map-toggle-button">
                {mostrarMapa ? "Ocultar mapa general" : "Ver mapa general"}
            </button>

            {mostrarMapa && (
                <MapContainer
                    center={[-33.8932, -60.5723]}
                    zoom={13}
                    style={{ height: "400px", width: "100%", marginBottom: "20px" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    />
                    {coordenadasReportes.map((r) => (
                        <Marker key={r.id} position={[r.latitud!, r.longitud!]} icon={customIcon}>
                            <Popup>
                                <strong>{r.descripcion}</strong><br />
                                Categoría: {r.categoria}<br />
                                Estado: {r.estado}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}

            {/* Sección: No asignados */}
            <h3 className="section-title">Reportes sin asignar</h3>
            {noAsignados.length === 0 ? <p>No hay reportes nuevos.</p> : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                            <th>Imagen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noAsignados.map((r) => (
                            <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>{r.descripcion}</td>
                                <td>{r.categoria}</td>
                                <td>{new Date(r.fecha).toLocaleDateString()}</td>
                                <td>{r.estado}</td>
                                <td>
                                    {asignandoId === r.id ? (
                                        <>
                                            <select onChange={e => setTecnicoSeleccionado(Number(e.target.value))}>
                                                <option value={0}>Elegir técnico</option>
                                                {tecnicos.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => asignarTecnico(r.id)}>Confirmar</button>
                                            <button onClick={() => setAsignandoId(null)}>Cancelar</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setAsignandoId(r.id)}>Asignar</button>
                                    )}
                                </td>
                                <td>
                                    {r.imagenUrl ? (
                                        <img
                                            src={`https://localhost:7281${r.imagenUrl}`}
                                            alt="reporte"
                                            className="admin-img"
                                        />
                                    ) : "Sin imagen"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Asignados */}
            <h3 className="section-title">Reportes asignados</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Imagen</th>
                        <th>Comentarios</th>
                    </tr>
                </thead>
                <tbody>
                    {asignados.map((r) => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.descripcion}</td>
                            <td>{r.categoria}</td>
                            <td>{new Date(r.fecha).toLocaleDateString()}</td>
                            <td>{r.estado}</td>
                            <td>
                                {r.imagenUrl ? (
                                    <img
                                        src={`https://localhost:7281${r.imagenUrl}`}
                                        alt="reporte"
                                        className="admin-img"
                                    />
                                ) : "Sin imagen"}
                            </td>
                            <td>
                                <button
                                    className="button"
                                    onClick={() => {
                                        if (!comentariosVisibles[r.id]) {
                                            cargarComentarios(r.id);
                                        }
                                        setComentariosVisibles((prev) => ({
                                            ...prev,
                                            [r.id]: !prev[r.id],
                                        }));
                                    }}
                                >
                                    {comentariosVisibles[r.id] ? "Ocultar comentarios" : "Ver comentarios"}
                                </button>

                                {comentariosVisibles[r.id] && (
                                    <div style={{ marginTop: "8px" }}>
                                        {comentarios[r.id]?.length > 0 ? (
                                            <ul className="comentarios-lista">
                                                {comentarios[r.id].map((c) => (
                                                    <li key={c.id}>
                                                        <strong>{c.autor}</strong>: {c.contenido}{" "}
                                                        <small>({new Date(c.fecha).toLocaleDateString()})</small>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="sin-comentarios">No hay comentarios.</p>
                                        )}

                                        <input
                                            type="text"
                                            placeholder="Escribir comentario"
                                            value={nuevoComentario[r.id] || ""}
                                            onChange={(e) =>
                                                setNuevoComentario((prev) => ({ ...prev, [r.id]: e.target.value }))
                                            }
                                            className="input"
                                        />
                                        <button className="button" onClick={() => enviarComentario(r.id)}>Enviar</button>
                                    </div>
                                )}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Resueltos */}
            <h3 className="section-title">Reportes resueltos</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Imagen</th>
                    </tr>
                </thead>
                <tbody>
                    {resueltos.map((r) => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.descripcion}</td>
                            <td>{r.categoria}</td>
                            <td>{new Date(r.fecha).toLocaleDateString()}</td>
                            <td>{r.estado}</td>
                            <td>
                                {r.imagenUrl ? (
                                    <img
                                        src={`https://localhost:7281${r.imagenUrl}`}
                                        alt="reporte"
                                        className="admin-img"
                                    />
                                ) : "Sin imagen"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

}


