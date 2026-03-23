using FluentAssertions;
using CrmObras.Application.Features.Users.Commands.DeleteUser;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class DeleteUserCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldDeleteUser_WhenExists()
    {
        await using var db = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, FullName = "João", Email = "joao@teste.com" });
        await db.SaveChangesAsync();

        var handler = new DeleteUserCommandHandler(db);
        await handler.HandleAsync(new DeleteUserCommand(userId));

        var deletedUser = await db.Users.FindAsync(userId);
        deletedUser.Should().BeNull();
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenDoesNotExist()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new DeleteUserCommandHandler(db);

        var act = async () => await handler.HandleAsync(new DeleteUserCommand(Guid.NewGuid()));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
