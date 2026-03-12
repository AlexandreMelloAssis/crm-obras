using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Auth;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController(AuthService service) : ControllerBase
{
    [HttpPost("login")]
    public Task<AuthResponse> Login([FromBody] AuthRequest request, CancellationToken cancellationToken) =>
        service.LoginAsync(request, cancellationToken);

    [HttpPost("register")]
    public Task<AuthResponse> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken) =>
        service.RegisterAsync(request, cancellationToken);
}
