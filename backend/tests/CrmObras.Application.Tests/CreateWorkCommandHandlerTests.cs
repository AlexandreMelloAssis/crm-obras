using FluentAssertions;
using CrmObras.Application.Features.Works.Commands.CreateWork;
using CrmObras.Application.Tests.Common;
using Xunit;

namespace CrmObras.Application.Tests;

public class CreateWorkCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenMandatoryFieldsAreMissing()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateWorkCommandHandler(db);

        var act = async () => await handler.HandleAsync(new CreateWorkCommand("", ""));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task HandleAsync_ShouldPersistProject_WhenValid()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateWorkCommandHandler(db);

        var result = await handler.HandleAsync(new CreateWorkCommand("Obra X", "Rua Y"));

        result.Name.Should().Be("Obra X");
        db.Works.Should().ContainSingle(x => x.Name == "Obra X");
    }
}
