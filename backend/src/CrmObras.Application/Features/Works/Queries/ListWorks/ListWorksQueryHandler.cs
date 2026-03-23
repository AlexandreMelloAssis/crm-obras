using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Works.Queries.ListWorks;

public class ListWorksQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<WorkDto>> HandleAsync(ListWorksQuery query, CancellationToken cancellationToken = default)
    {
        return await dbContext.Works
            .Select(x => new WorkDto(x.Id, x.Name, x.Address, x.Status.ToString()))
            .ToListAsync(cancellationToken);
    }
}

