namespace UrbanFix.Server.Models.DTOs
{
    public class NuevoComentarioDto
    {
        public string Contenido { get; set; }
        public int UsuarioId { get; set; }
        public int ReporteId { get; set; }
    }
}

