using CrmObras.Domain.Entities;

namespace CrmObras.Application.Abstractions.Auth;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
