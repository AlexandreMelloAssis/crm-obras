using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Projects.Queries.ListProjects;

public class ListProjectsQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<ProjectDto>> HandleAsync(ListProjectsQuery query, CancellationToken cancellationToken = default)
    {
        return await dbContext.WorkProjects
            .Select(x => new ProjectDto(x.Id, x.Name, x.Address, x.Responsible, x.Status.ToString()))
            .ToListAsync(cancellationToken);
    }
}
