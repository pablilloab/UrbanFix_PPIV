using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanFix.Server.Models
{
    public class Asignacion
    {
        public int Id { get; set; }

        // Relación con Reporte
        [ForeignKey("Reporte")]
        public int ReporteId { get; set; }
        public Reporte? Reporte { get; set; }

        // Relación con Técnico (usuario con rol = "Tecnico")
        [ForeignKey("Usuario")]
        public int TecnicoId { get; set; }
        public Usuario? Tecnico { get; set; }

        public DateTime FechaAsignacion { get; set; } = DateTime.Now;
    }
}

