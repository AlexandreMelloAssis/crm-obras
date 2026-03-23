using CrmObras.Application.Abstractions.Persistence;

namespace CrmObras.Application.Features.Works.Commands.DeleteWork;

public class DeleteWorkCommandHandler(IApplicationDbContext dbContext)
{
    public async Task HandleAsync(DeleteWorkCommand command, CancellationToken cancellationToken = default)
    {
        var work = await dbContext.Works.FindAsync(new object[] { command.Id }, cancellationToken);
        if (work == null)
            throw new InvalidOperationException("Obra não encontrada.");

        dbContext.Works.Remove(work);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
