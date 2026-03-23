using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Entities;

namespace CrmObras.Application.Features.Workstages;

public class ProjectStageService(IApplicationDbContext dbContext)
{
    public async Task<Guid> CreateAsync(CreateStageRequest request, CancellationToken cancellationToken = default)
    {
        var stage = new WorkStage
        {
            WorkId = request.WorkId,
            Name = request.Name,
            Description = request.Description
        };

        dbContext.WorkStages.Add(stage);
        await dbContext.SaveChangesAsync(cancellationToken);
        return stage.Id;
    }
}

