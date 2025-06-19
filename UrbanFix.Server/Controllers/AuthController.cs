using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UrbanFix.Server.DTOs;
using UrbanFix.Server.Models;

namespace UrbanFix.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UrbanFixContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(UrbanFixContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("registro")]
        public IActionResult Registrar(UsuarioRegistroDto dto)
        {
            var existe = _context.Usuarios.Any(u => u.Email == dto.Email);
            if (existe)
                return BadRequest("El usuario ya está registrado.");

            var usuario = new Usuario
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                Contraseña = dto.Contraseña,
                Rol = dto.Rol
            };

            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            return Ok("Usuario registrado correctamente.");
        }

        [HttpPost("login")]
        public IActionResult Login(UsuarioLoginDto dto)
        {
            var usuario = _context.Usuarios.FirstOrDefault(u =>
                u.Email == dto.Email && u.Contraseña == dto.Contraseña);

            if (usuario == null)
                return Unauthorized("Credenciales incorrectas.");

            var token = GenerarToken(usuario);

            return Ok(new { token });
        }

        private string GenerarToken(Usuario usuario)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings.GetValue<string>("SecretKey");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nombre),
                new Claim(ClaimTypes.Role, usuario.Rol),
                new Claim(ClaimTypes.Email, usuario.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(jwtSettings.GetValue<int>("ExpiresInMinutes")),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

