import { useState } from "react";
import axios from "axios";

export default function Registro() {
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        contraseña: "",
        rol: "Ciudadano",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("https://localhost:7281/api/auth/registro", form);
            alert("Registrado correctamente");
        } catch (err) {
            alert("Error al registrar");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Registro</h2>
                <input
                    name="nombre"
                    placeholder="Nombre"
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    name="contraseña"
                    type="password"
                    placeholder="Contraseña"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );

}
