import { useEffect, useState } from "react";
import axios from "axios";
/*import { useNavigate } from "react-router-dom";*/
import Navbar from "../../components/Navbar"; 

interface Reporte {
    id: number;
    descripcion: string;
    categoria: string;
    fecha: string;
    estado: string;
    imagenUrl?: string;
}

interface Comentario {
    id: number;
    contenido: string;
    fecha: string;
    autor: string;
}

export default function PanelCiudadano() {
    const token = localStorage.getItem("token");
    /*const navigate = useNavigate();*/

    //const logout = () => {
    //    localStorage.removeItem("token");
    //    navigate("/");
    //};

    const [form, setForm] = useState({
        descripcion: "",
        categoria: "",
    });

    const [imagen, setImagen] = useState<File | null>(null);
    const [misReportes, setMisReportes] = useState<Reporte[]>([]);

    const tokenPayload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const usuarioId = tokenPayload
        ? parseInt(tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"])
        : 0;

    const [comentarios, setComentarios] = useState<{ [key: number]: Comentario[] }>({});
    const [comentariosVisibles, setComentariosVisibles] = useState<{ [key: number]: boolean }>({});


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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImagen(e.target.files?.[0] || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imagen) {
            alert("Debes seleccionar una imagen.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitud = position.coords.latitude;
            const longitud = position.coords.longitude;

            const formData = new FormData();
            formData.append("descripcion", form.descripcion);
            formData.append("categoria", form.categoria);
            formData.append("fecha", new Date().toISOString());
            //formData.append("latitud", latitud.toString());
            //formData.append("longitud", longitud.toString());
            formData.append("latitud", latitud.toLocaleString("en-US", { useGrouping: false }));
            formData.append("longitud", longitud.toLocaleString("en-US", { useGrouping: false }));

            formData.append("estado", "Pendiente");
            formData.append("usuarioId", usuarioId.toString());
            formData.append("imagen", imagen!);

            try {
                await axios.post("https://localhost:7281/api/reportes/con-imagen", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                });
                alert("Reporte con imagen enviado con éxito");
                setForm({ descripcion: "", categoria: "" });
                setImagen(null);
                obtenerReportes();
            } catch (err) {
                alert("Error al enviar reporte con imagen");
                console.error(err);
            }
        }, () => {
            alert("No se pudo obtener la ubicación.");
        });
    };

    const obtenerReportes = async () => {
        try {
            const res = await axios.get(`https://localhost:7281/api/reportes/por-usuario/${usuarioId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMisReportes(res.data);
        } catch (err) {
            console.error("Error al obtener reportes", err);
        }
    };

    useEffect(() => {
        obtenerReportes();
    }, []);

    return (
        <div className="ciudadano-container">

            <Navbar titulo="Panel Ciudadano" />

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="ciudadano-form">
                <input
                    name="descripcion"
                    placeholder="Descripción del problema"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="input"
                />
                <select name="categoria" value={form.categoria} onChange={handleChange} className="input">
                    <option value="">Seleccione categoría</option>
                    <option value="Alumbrado">Alumbrado</option>
                    <option value="Bache">Bache</option>
                    <option value="Residuos">Residuos</option>
                    <option value="Vereda Rota">Vereda Rota</option>
                    <option value="Caballos Sueltos">Caballos Sueltos</option>
                    <option value="Peligro Eléctrico">Peligro Eléctrico</option>
                    <option value="Otros">Otros</option>
                </select>

                <input type="file" accept="image/*" onChange={handleFileChange} className="input" />
                <button type="submit" className="button">Enviar reporte</button>
            </form>

            <hr />

            <h3 className="section-title">Mis Reportes</h3>
            {misReportes.length === 0 ? (
                <p>No enviaste reportes aún.</p>
            ) : (
                <table className="ciudadano-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Imagen</th>
                            <th>Comentarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {misReportes.map((r) => (
                            <tr key={r.id}>
                                <td>{r.descripcion}</td>
                                <td>{r.categoria}</td>
                                <td>{new Date(r.fecha).toLocaleDateString()}</td>
                                <td>{r.estado}</td>
                                <td>
                                    {r.imagenUrl ? (
                                        <img
                                            src={`https://localhost:7281${r.imagenUrl}`}
                                            alt="imagen"
                                            className="reporte-img"
                                        />
                                    ) : (
                                        "Sin imagen"
                                    )}
                                </td>
                                <td colSpan={5}>
                                    <div style={{ marginTop: "8px" }}>
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
                                            comentarios[r.id]?.length > 0 ? (
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
                                            )
                                        )}
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

}


