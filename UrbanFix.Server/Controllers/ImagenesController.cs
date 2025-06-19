using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanFix.Server.Models;

namespace UrbanFix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagenesController : ControllerBase
    {
        private readonly UrbanFixContext _context;

        public ImagenesController(UrbanFixContext context)
        {
            _context = context;
        }

        // GET: api/Imagenes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Imagen>>> GetImagenes()
        {
            return await _context.Imagenes
                .Include(i => i.Reporte)
                .ToListAsync();
        }

        // GET: api/Imagenes/por-reporte/5
        [HttpGet("por-reporte/{reporteId}")]
        public async Task<ActionResult<IEnumerable<Imagen>>> GetImagenesPorReporte(int reporteId)
        {
            return await _context.Imagenes
                .Where(i => i.ReporteId == reporteId)
                .ToListAsync();
        }

        // POST: api/Imagenes
        [HttpPost]
        public async Task<ActionResult<Imagen>> PostImagen(Imagen imagen)
        {
            _context.Imagenes.Add(imagen);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetImagenes), new { id = imagen.Id }, imagen);
        }

        // DELETE: api/Imagenes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImagen(int id)
        {
            var imagen = await _context.Imagenes.FindAsync(id);
            if (imagen == null)
            {
                return NotFound();
            }

            _context.Imagenes.Remove(imagen);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

