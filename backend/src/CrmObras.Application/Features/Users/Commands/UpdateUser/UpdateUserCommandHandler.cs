using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(Guid Id, string FullName, bool IsActive);

public class UpdateUserCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<UserDto> HandleAsync(UpdateUserCommand command, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FindAsync(new object[] { command.Id }, cancellationToken);

        if (user == null)
            throw new InvalidOperationException("Usuário não encontrado.");

        user.FullName = command.FullName;
        user.IsActive = command.IsActive;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new UserDto(user.Id, user.FullName, user.Email, user.IsActive);
    }
}
