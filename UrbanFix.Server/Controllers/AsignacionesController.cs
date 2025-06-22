using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanFix.Server.Models;

namespace UrbanFix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsignacionesController : ControllerBase
    {
        private readonly UrbanFixContext _context;

        public AsignacionesController(UrbanFixContext context)
        {
            _context = context;
        }

        // GET: api/Asignaciones
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Asignacion>>> GetAsignaciones()
        {
            return await _context.Asignaciones
                .Include(a => a.Reporte)
                .Include(a => a.Tecnico)
                .ToListAsync();
        }

        // GET: api/Asignaciones/por-tecnico/5
        //[HttpGet("por-tecnico/{tecnicoId}")]
        //public async Task<ActionResult<IEnumerable<Asignacion>>> GetPorTecnico(int tecnicoId)
        //{
        //    return await _context.Asignaciones
        //        .Where(a => a.TecnicoId == tecnicoId)
        //        .Include(a => a.Reporte)
        //        .ToListAsync();
        //}

        // GET: api/Asignaciones/por-reporte/5
        [HttpGet("por-reporte/{reporteId}")]
        public async Task<ActionResult<IEnumerable<Asignacion>>> GetPorReporte(int reporteId)
        {
            return await _context.Asignaciones
                .Where(a => a.ReporteId == reporteId)
                .Include(a => a.Tecnico)
                .ToListAsync();
        }

        // POST: api/Asignaciones
        [HttpPost]
        public async Task<ActionResult<Asignacion>> PostAsignacion(Asignacion asignacion)
        {
            _context.Asignaciones.Add(asignacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAsignaciones), new { id = asignacion.Id }, asignacion);
        }

        // DELETE: api/Asignaciones/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsignacion(int id)
        {
            var asignacion = await _context.Asignaciones.FindAsync(id);
            if (asignacion == null)
            {
                return NotFound();
            }

            _context.Asignaciones.Remove(asignacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("por-tecnico/{tecnicoId}")]
        public IActionResult GetPorTecnico(int tecnicoId)
        {
            var reportesAsignados = _context.Asignaciones
                .Where(a => a.TecnicoId == tecnicoId)
                .Select(a => new
                {
                    a.Reporte.Id,
                    a.Reporte.Descripcion,
                    a.Reporte.Categoria,
                    a.Reporte.Fecha,
                    a.Reporte.Estado,
                    ImagenUrl = a.Reporte.Imagenes.FirstOrDefault().Ruta,
                    AsignacionId = a.Id
                })
                .ToList();

            return Ok(reportesAsignados);
        }


    }
}

