using Microsoft.EntityFrameworkCore;

namespace UrbanFix.Server.Models
{
    public class UrbanFixContext : DbContext
    {
        public UrbanFixContext(DbContextOptions<UrbanFixContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Reporte> Reportes { get; set; }
        public DbSet<Comentario> Comentarios { get; set; }
        public DbSet<Imagen> Imagenes { get; set; }
        public DbSet<Asignacion> Asignaciones { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Asignacion>()
                .HasOne(a => a.Tecnico)
                .WithMany()
                .HasForeignKey(a => a.TecnicoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comentario>()
                .HasOne(c => c.Usuario)
                .WithMany()
                .HasForeignKey(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

        }

    }
}
