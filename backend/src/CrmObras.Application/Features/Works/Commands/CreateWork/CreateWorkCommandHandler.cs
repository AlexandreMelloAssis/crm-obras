using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Works.Commands.CreateWork;

public class CreateWorkCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<WorkDto> HandleAsync(CreateWorkCommand command, CancellationToken cancellationToken = default)
    {
        CreateWorkCommandValidator.Validate(command);

        var entity = new Work
        {
            Name = command.Name,
            Address = command.Address,
            Status = WorkStatus.Planning
        };

        dbContext.Works.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new WorkDto(entity.Id, entity.Name, entity.Address, entity.Status.ToString());
    }
}

