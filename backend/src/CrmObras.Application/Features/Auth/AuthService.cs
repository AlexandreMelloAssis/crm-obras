using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Auth;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Auth;

public class AuthService(IApplicationDbContext dbContext, IJwtTokenGenerator tokenGenerator, IPasswordHasher passwordHasher)
{
    public async Task<AuthResponse> LoginAsync(AuthRequest request, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken)
            ?? throw new InvalidOperationException("Usuário ou senha inválidos.");

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new InvalidOperationException("Usuário ou senha inválidos.");

        return new AuthResponse(tokenGenerator.GenerateToken(user), user.FullName, user.Email);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
            throw new InvalidOperationException("E-mail já cadastrado.");

        var role = await dbContext.Roles.FirstOrDefaultAsync(r => r.Name == "Admin", cancellationToken)
            ?? new Role { Name = "Admin" };

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHasher.Hash(request.Password),
            Profile = UserProfile.Admin,
            Role = role
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse(tokenGenerator.GenerateToken(user), user.FullName, user.Email);
    }
}
