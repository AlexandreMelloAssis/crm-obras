using FluentAssertions;
using CrmObras.Application.Features.Projects.Queries.ListProjects;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class ListProjectsQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnProjects()
    {
        await using var db = TestDbContextFactory.Create();
        db.WorkProjects.Add(new WorkProject { Name = "Obra A", Address = "Rua 1", Responsible = "Carlos" });
        db.WorkProjects.Add(new WorkProject { Name = "Obra B", Address = "Rua 2", Responsible = "Ana" });
        await db.SaveChangesAsync();

        var handler = new ListProjectsQueryHandler(db);
        var result = await handler.HandleAsync(new ListProjectsQuery());

        result.Should().HaveCount(2);
    }
}
