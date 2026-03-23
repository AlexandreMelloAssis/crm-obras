using FluentAssertions;
using CrmObras.Application.Features.Users.Queries.GetUser;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class GetUserQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnUser_WhenExists()
    {
        await using var db = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, FullName = "João", Email = "joao@teste.com" });
        await db.SaveChangesAsync();

        var handler = new GetUserQueryHandler(db);
        var result = await handler.HandleAsync(new GetUserQuery(userId));

        result.Should().NotBeNull();
        result.FullName.Should().Be("João");
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenDoesNotExist()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new GetUserQueryHandler(db);

        var act = async () => await handler.HandleAsync(new GetUserQuery(Guid.NewGuid()));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
