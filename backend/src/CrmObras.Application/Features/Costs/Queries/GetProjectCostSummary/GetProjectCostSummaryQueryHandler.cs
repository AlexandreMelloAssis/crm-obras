using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Costs.Queries.GetProjectCostSummary;

public class GetProjectCostSummaryQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<CostSummaryDto> HandleAsync(GetProjectCostSummaryQuery query, CancellationToken cancellationToken = default)
    {
        GetProjectCostSummaryQueryValidator.Validate(query);

        var grouped = await dbContext.Expenses
            .Where(x => x.WorkId == query.WorkId)
            .GroupBy(x => x.CostType)
            .Select(g => new { Type = g.Key.ToString(), Total = g.Sum(x => x.Amount) })
            .ToListAsync(cancellationToken);

        return new CostSummaryDto(query.WorkId, grouped.Sum(x => x.Total), grouped.ToDictionary(x => x.Type, x => x.Total));
    }
}

