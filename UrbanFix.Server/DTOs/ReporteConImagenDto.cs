using System;

namespace UrbanFix.Server.Models.DTOs
{
    public class ReporteConImagenDto
    {
        public string Descripcion { get; set; }
        public string Categoria { get; set; }
        public DateTime Fecha { get; set; }
        public double Latitud { get; set; }
        public double Longitud { get; set; }
        public string Estado { get; set; }
        public int UsuarioId { get; set; }
    }
}
