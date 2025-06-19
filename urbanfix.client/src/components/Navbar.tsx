import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Vamos a definir los estilos aparte

interface NavbarProps {
    titulo: string;
}

export default function Navbar({ titulo }: NavbarProps) {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="navbar-title">{titulo}</div>
            <button className="navbar-button" onClick={logout}>
                Cerrar sesión
            </button>
        </header>
    );
}
