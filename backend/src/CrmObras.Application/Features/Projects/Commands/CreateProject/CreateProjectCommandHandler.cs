using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Projects.Commands.CreateProject;

public class CreateProjectCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<ProjectDto> HandleAsync(CreateProjectCommand command, CancellationToken cancellationToken = default)
    {
        CreateProjectCommandValidator.Validate(command);

        var entity = new WorkProject
        {
            Name = command.Name,
            Address = command.Address,
            Responsible = command.Responsible,
            Status = WorkProjectStatus.Planning
        };

        dbContext.WorkProjects.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ProjectDto(entity.Id, entity.Name, entity.Address, entity.Responsible, entity.Status.ToString());
    }
}
