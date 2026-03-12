using FluentAssertions;
using CrmObras.Application.Features.Projects.Commands.CreateProject;
using CrmObras.Application.Tests.Common;
using Xunit;

namespace CrmObras.Application.Tests;

public class CreateProjectCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenMandatoryFieldsAreMissing()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateProjectCommandHandler(db);

        var act = async () => await handler.HandleAsync(new CreateProjectCommand("", "", ""));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task HandleAsync_ShouldPersistProject_WhenValid()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateProjectCommandHandler(db);

        var result = await handler.HandleAsync(new CreateProjectCommand("Obra X", "Rua Y", "Maria"));

        result.Name.Should().Be("Obra X");
        db.WorkProjects.Should().ContainSingle(x => x.Name == "Obra X");
    }
}
