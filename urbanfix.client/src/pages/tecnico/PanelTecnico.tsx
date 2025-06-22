import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; 

interface Comentario {
    id: number;
    contenido: string;
    fecha: string;
    autor: string;
}

interface Reporte {
    id: number;
    descripcion: string;
    categoria: string;
    fecha: string;
    estado: string;
    asignacionId: number;
    imagenUrl?: string;
    comentarios?: Comentario[];
}

export default function PanelTecnico() {
    const token = localStorage.getItem("token");

    const tokenPayload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const tecnicoId = tokenPayload
        ? parseInt(tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"])
        : 0;

    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [comentarios, setComentarios] = useState<{ [key: number]: Comentario[] }>({});
    const [nuevoComentario, setNuevoComentario] = useState<{ [key: number]: string }>({});
    const [comentariosVisibles, setComentariosVisibles] = useState<{ [key: number]: boolean }>({});

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const obtenerAsignados = async () => {
        try {
            const res = await axios.get(`https://localhost:7281/api/asignaciones/por-tecnico/${tecnicoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportes(res.data);
        } catch (err) {
            console.error("Error al cargar reportes asignados", err);
        }
    };

    const cargarComentarios = async (reporteId: number) => {
        try {
            const res = await axios.get(`https://localhost:7281/api/comentarios/por-reporte/${reporteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComentarios((prev) => ({ ...prev, [reporteId]: res.data }));
        } catch (err) {
            console.error("Error al cargar comentarios", err);
        }
    };

    const enviarComentario = async (reporteId: number) => {
        const contenido = nuevoComentario[reporteId];
        if (!contenido) return;

        const usuarioId = tecnicoId;

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
            alert("No se pudo enviar el comentario");
        }
    };

    const cambiarEstado = async (reporteId: number, nuevoEstado: string) => {
        try {
            await axios.put(`https://localhost:7281/api/reportes/${reporteId}/estado`, {
                estado: nuevoEstado
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            obtenerAsignados();
        } catch (err) {
            alert("No se pudo cambiar el estado");
        }
    };

    useEffect(() => {
        obtenerAsignados();
    }, []);

    const renderSeccion = (titulo: string, reportesFiltrados: Reporte[]) => (
        <>
            <h3 className="section-title">{titulo}</h3>
            {reportesFiltrados.length === 0 ? (
                <p>No hay reportes en esta sección.</p>
            ) : (
                <table className="tecnico-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                            <th>Imagen</th>
                            <th>Comentarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportesFiltrados.map((r) => (
                            <tr key={r.id}>
                                <td>{r.descripcion}</td>
                                <td>{r.categoria}</td>
                                <td>{new Date(r.fecha).toLocaleDateString()}</td>
                                <td>{r.estado}</td>
                                <td>
                                    {r.estado === "Pendiente" && (
                                        <button className="button" onClick={() => cambiarEstado(r.id, "En progreso")}>
                                            Marcar En progreso
                                        </button>
                                    )}
                                    {r.estado === "En progreso" && (
                                        <button className="button" onClick={() => cambiarEstado(r.id, "Resuelto")}>
                                            Marcar Resuelto
                                        </button>
                                    )}
                                </td>
                                <td>
                                    {r.imagenUrl ? (
                                        <img
                                            src={`https://localhost:7281${r.imagenUrl}`}
                                            alt="reporte"
                                            className="reporte-img"
                                        />
                                    ) : (
                                        "Sin imagen"
                                    )}
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
                                                            <strong>{c.autor}</strong>: {c.contenido}
                                                            <br />
                                                            <small>{new Date(c.fecha).toLocaleDateString()}</small>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="sin-comentarios">No hay comentarios.</p>
                                            )}

                                            <input
                                                type="text"
                                                placeholder="Agregar comentario"
                                                value={nuevoComentario[r.id] || ""}
                                                onChange={(e) =>
                                                    setNuevoComentario((prev) => ({ ...prev, [r.id]: e.target.value }))
                                                }
                                                className="input"
                                            />
                                            <button className="button" onClick={() => enviarComentario(r.id)}>
                                                Enviar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );


    return (
        <div className="tecnico-container">
            <Navbar titulo="Panel Técnico" />

            {renderSeccion("Reportes sin iniciar", reportes.filter(r => r.estado === "Pendiente"))}
            {renderSeccion("Reportes en progreso", reportes.filter(r => r.estado === "En progreso"))}
            {renderSeccion("Reportes finalizados", reportes.filter(r => r.estado === "Resuelto"))}
        </div>
    );

}
