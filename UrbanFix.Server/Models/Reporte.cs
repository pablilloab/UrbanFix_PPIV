using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Net.Mime.MediaTypeNames;

namespace UrbanFix.Server.Models
{
    public class Reporte
    {
        public int Id { get; set; }

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public string Categoria { get; set; } = string.Empty;

        public DateTime Fecha { get; set; } = DateTime.Now;

        public double Latitud { get; set; }
        public double Longitud { get; set; }

        public string Estado { get; set; } = "Nuevo";

        // Relación con Usuario
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

        // Relaciones de navegación
        public ICollection<Comentario>? Comentarios { get; set; }
        public ICollection<Imagen>? Imagenes { get; set; }
        public ICollection<Asignacion>? Asignaciones { get; set; }
    }
}
