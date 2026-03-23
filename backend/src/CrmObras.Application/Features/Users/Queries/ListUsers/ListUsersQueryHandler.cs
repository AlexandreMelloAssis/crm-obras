using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Features.Users.Queries.ListUsers;

public record ListUsersQuery();

public class ListUsersQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<UserDto>> HandleAsync(ListUsersQuery query, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Select(u => new UserDto(u.Id, u.FullName, u.Email, u.IsActive))
            .ToListAsync(cancellationToken);
    }
}
