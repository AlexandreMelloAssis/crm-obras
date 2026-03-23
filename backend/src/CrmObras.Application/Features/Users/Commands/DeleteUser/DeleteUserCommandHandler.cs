using CrmObras.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Features.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid Id);

public class DeleteUserCommandHandler(IApplicationDbContext dbContext)
{
    public async Task HandleAsync(DeleteUserCommand command, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FindAsync(new object[] { command.Id }, cancellationToken);

        if (user == null)
            throw new InvalidOperationException("Usuário não encontrado.");

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
