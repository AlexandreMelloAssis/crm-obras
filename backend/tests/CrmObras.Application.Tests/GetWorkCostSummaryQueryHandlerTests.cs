using FluentAssertions;
using CrmObras.Application.Features.Costs.Queries.GetProjectCostSummary;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;
using Xunit;

namespace CrmObras.Application.Tests;

public class GetProjectCostSummaryQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldConsolidateCostsByType()
    {
        await using var db = TestDbContextFactory.Create();
        var projectId = Guid.NewGuid();

        db.Expenses.AddRange(
            new Expense { WorkId = projectId, CostType = CostType.Labor, Amount = 100m, Description = "A" },
            new Expense { WorkId = projectId, CostType = CostType.Labor, Amount = 50m, Description = "B" },
            new Expense { WorkId = projectId, CostType = CostType.Utility, Amount = 30m, Description = "C" });
        await db.SaveChangesAsync();

        var handler = new GetProjectCostSummaryQueryHandler(db);
        var result = await handler.HandleAsync(new GetProjectCostSummaryQuery(projectId));

        result.Total.Should().Be(180m);
        result.ByType["Labor"].Should().Be(150m);
        result.ByType["Utility"].Should().Be(30m);
    }
}
