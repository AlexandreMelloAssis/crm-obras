using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Features.Users.Queries.GetUser;

public record GetUserQuery(Guid Id);

public class GetUserQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<UserDto> HandleAsync(GetUserQuery query, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == query.Id, cancellationToken);

        if (user == null)
            throw new InvalidOperationException("Usuário não encontrado.");

        return new UserDto(user.Id, user.FullName, user.Email, user.IsActive);
    }
}
