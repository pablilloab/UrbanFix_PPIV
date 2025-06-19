using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanFix.Server.Models;
using UrbanFix.Server.Models.DTOs;

namespace UrbanFix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportesController : ControllerBase
    {
        private readonly UrbanFixContext _context;

        public ReportesController(UrbanFixContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetReportes()
        {
            var reportes = _context.Reportes
                .Select(r => new
                {
                    r.Id,
                    r.Descripcion,
                    r.Categoria,
                    r.Fecha,
                    r.Estado,
                    r.UsuarioId,
                    r.Latitud,
                    r.Longitud,
                    ImagenUrl = r.Imagenes.FirstOrDefault().Ruta,
                    Asignado = r.Asignaciones.Any()
                })
                .ToList();

            return Ok(reportes);
        }

        // GET: api/Reportes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reporte>> GetReporte(int id)
        {
            var reporte = await _context.Reportes
                .Include(r => r.Usuario)
                .Include(r => r.Comentarios)
                .Include(r => r.Imagenes)
                .Include(r => r.Asignaciones)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reporte == null)
            {
                return NotFound();
            }

            return reporte;
        }

        // POST: api/Reportes
        [HttpPost]
        public async Task<ActionResult<Reporte>> PostReporte(Reporte reporte)
        {
            _context.Reportes.Add(reporte);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReporte), new { id = reporte.Id }, reporte);
        }

        // DELETE: api/Reportes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReporte(int id)
        {
            var reporte = await _context.Reportes.FindAsync(id);
            if (reporte == null)
            {
                return NotFound();
            }

            _context.Reportes.Remove(reporte);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("por-usuario/{usuarioId}")]
        public IActionResult GetPorUsuario(int usuarioId)
        {
            var reportes = _context.Reportes
                .Where(r => r.UsuarioId == usuarioId)
                .Select(r => new
                {
                    r.Id,
                    r.Descripcion,
                    r.Categoria,
                    r.Fecha,
                    r.Estado,
                    ImagenUrl = r.Imagenes.FirstOrDefault().Ruta
                })
                .ToList();

            return Ok(reportes);
        }


        [HttpPost("con-imagen")]
        public async Task<IActionResult> CrearConImagen([FromForm] ReporteConImagenDto dto, IFormFile imagen)
        {
            if (imagen == null || imagen.Length == 0)
                return BadRequest("Imagen no válida.");

            // Generar nombre único y ruta
            var nombreArchivo = $"{Guid.NewGuid()}_{imagen.FileName}";
            var ruta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "imagenes", nombreArchivo);

            // Guardar imagen en disco
            using (var stream = new FileStream(ruta, FileMode.Create))
            {
                await imagen.CopyToAsync(stream);
            }

            // Crear y guardar el reporte
            var reporte = new Reporte
            {
                Descripcion = dto.Descripcion,
                Categoria = dto.Categoria,
                Fecha = dto.Fecha,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                Estado = dto.Estado,
                UsuarioId = dto.UsuarioId
            };

            _context.Reportes.Add(reporte);
            await _context.SaveChangesAsync();

            // Asociar imagen al reporte
            var imagenEntity = new Imagen
            {
                Ruta = $"/imagenes/{nombreArchivo}",
                ReporteId = reporte.Id
            };

            _context.Imagenes.Add(imagenEntity);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Reporte con imagen guardado correctamente" });
        }

        [HttpPut("{id}/estado")]
        public IActionResult CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
        {
            var reporte = _context.Reportes.FirstOrDefault(r => r.Id == id);
            if (reporte == null)
                return NotFound();

            reporte.Estado = dto.Estado;
            _context.SaveChanges();

            return Ok(new { mensaje = "Estado actualizado correctamente" });
        }



    }
}
