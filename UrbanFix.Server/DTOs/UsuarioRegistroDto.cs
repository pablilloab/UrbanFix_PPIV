namespace UrbanFix.Server.DTOs
{
    public class UsuarioRegistroDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Contraseña { get; set; } = string.Empty;
        public string Rol { get; set; } = "Ciudadano"; // por defecto
    }
}

