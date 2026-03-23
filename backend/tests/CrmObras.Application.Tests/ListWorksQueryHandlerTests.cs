using FluentAssertions;
using CrmObras.Application.Features.Works.Queries.ListWorks;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class ListWorksQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnProjects()
    {
        await using var db = TestDbContextFactory.Create();
        db.Works.Add(new Work { Name = "Obra A", Address = "Rua 1" });
        db.Works.Add(new Work { Name = "Obra B", Address = "Rua 2" });
        await db.SaveChangesAsync();

        var handler = new ListWorksQueryHandler(db);
        var result = await handler.HandleAsync(new ListWorksQuery());

        result.Should().HaveCount(2);
    }
}
