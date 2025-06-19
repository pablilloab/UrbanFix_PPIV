using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanFix.Server.Models
{
    public class Imagen
    {
        public int Id { get; set; }
        public string Ruta { get; set; } = string.Empty;

        // Relación con Reporte
        [ForeignKey("Reporte")]
        public int ReporteId { get; set; }
        public Reporte? Reporte { get; set; }
    }
}

