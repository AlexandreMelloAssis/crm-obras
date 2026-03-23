using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Works.Queries.GetWork;

public class GetWorkQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<WorkDto> HandleAsync(GetWorkQuery query, CancellationToken cancellationToken = default)
    {
        var work = await dbContext.Works
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == query.Id, cancellationToken);
            
        if (work == null)
            throw new InvalidOperationException("Obra não encontrada.");

        return new WorkDto(work.Id, work.Name, work.Address, work.Status.ToString());
    }
}
