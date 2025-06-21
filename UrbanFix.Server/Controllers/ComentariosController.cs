using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanFix.Server.Models;
using UrbanFix.Server.Models.DTOs;

namespace UrbanFix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComentariosController : ControllerBase
    {
        private readonly UrbanFixContext _context;

        public ComentariosController(UrbanFixContext context)
        {
            _context = context;
        }

        // GET: api/Comentarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comentario>>> GetComentarios()
        {
            return await _context.Comentarios
                .Include(c => c.Usuario)
                .Include(c => c.Reporte)
                .ToListAsync();
        }

        // GET: api/Comentarios/por-reporte/5
        [HttpGet("por-reporte/{reporteId}")]
        public async Task<ActionResult<IEnumerable<Comentario>>> GetComentariosPorReporte(int reporteId)
        {
            return await _context.Comentarios
                .Where(c => c.ReporteId == reporteId)
                .Include(c => c.Usuario)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> PostComentario(NuevoComentarioDto dto)
        {
            var comentario = new Comentario
            {
                Contenido = dto.Contenido,
                UsuarioId = dto.UsuarioId,
                ReporteId = dto.ReporteId,
                Fecha = DateTime.Now
            };

            _context.Comentarios.Add(comentario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Comentario agregado" });
        }


        // DELETE: api/Comentarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComentario(int id)
        {
            var comentario = await _context.Comentarios.FindAsync(id);
            if (comentario == null)
            {
                return NotFound();
            }

            _context.Comentarios.Remove(comentario);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

