using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanFix.Server.Models
{
    public class Comentario
    {
        public int Id { get; set; }

        [Required]
        public string Contenido { get; set; } = string.Empty;

        public DateTime Fecha { get; set; } = DateTime.Now;

        // Relación con Reporte
        [ForeignKey("Reporte")]
        public int ReporteId { get; set; }
        public Reporte? Reporte { get; set; }

        // Relación con Usuario
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }
    }
}

