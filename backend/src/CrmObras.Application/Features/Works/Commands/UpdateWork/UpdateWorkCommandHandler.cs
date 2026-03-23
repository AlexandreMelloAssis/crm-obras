using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Works.Commands.UpdateWork;

public class UpdateWorkCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<WorkDto> HandleAsync(UpdateWorkCommand command, CancellationToken cancellationToken = default)
    {
        var work = await dbContext.Works.FindAsync(new object[] { command.Id }, cancellationToken);
        if (work == null)
            throw new InvalidOperationException("Obra não encontrada.");

        work.Name = command.Name;
        work.Address = command.Address;
        work.Status = command.Status;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new WorkDto(work.Id, work.Name, work.Address, work.Status.ToString());
    }
}
