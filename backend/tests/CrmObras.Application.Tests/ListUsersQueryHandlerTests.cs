using FluentAssertions;
using CrmObras.Application.Features.Users.Queries.ListUsers;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class ListUsersQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnUsers()
    {
        await using var db = TestDbContextFactory.Create();
        db.Users.Add(new User { FullName = "User 1", Email = "1@teste.com" });
        db.Users.Add(new User { FullName = "User 2", Email = "2@teste.com" });
        await db.SaveChangesAsync();

        var handler = new ListUsersQueryHandler(db);
        var result = await handler.HandleAsync(new ListUsersQuery());

        result.Should().HaveCount(2);
    }
}
