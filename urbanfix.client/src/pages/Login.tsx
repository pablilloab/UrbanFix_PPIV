import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        contraseña: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("https://localhost:7281/api/auth/login", form);
            const token = res.data.token;
            localStorage.setItem("token", token);

            interface TokenPayload {
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
                [key: string]: any;
            }

            const decoded = jwtDecode<TokenPayload>(token);
            const rol = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];


            // Redirigir según el rol
            if (rol === "Administrador") {
                navigate("/admin");
            } else if (rol === "Tecnico") {
                navigate("/tecnico");
            } else {
                navigate("/ciudadano");
            }

        } catch {
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Iniciar Sesión</h2>
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
                <button type="submit">Ingresar</button>
            </form>

            <div className="login-register">
                <p>¿No tenés cuenta?</p>
                <button onClick={() => navigate("/registro")}>Registrate</button>
            </div>
        </div>
    );


}

