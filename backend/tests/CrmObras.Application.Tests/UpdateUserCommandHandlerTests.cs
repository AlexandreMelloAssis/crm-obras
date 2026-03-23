using FluentAssertions;
using CrmObras.Application.Features.Users.Commands.UpdateUser;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class UpdateUserCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldUpdateUser_WhenExists()
    {
        await using var db = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, FullName = "João", Email = "joao@teste.com", IsActive = true });
        await db.SaveChangesAsync();

        var handler = new UpdateUserCommandHandler(db);
        var command = new UpdateUserCommand(userId, "João Editado", false);
        
        var result = await handler.HandleAsync(command);

        var updatedUser = await db.Users.FindAsync(userId);
        updatedUser.Should().NotBeNull();
        updatedUser!.FullName.Should().Be("João Editado");
        updatedUser.IsActive.Should().BeFalse();
        result.FullName.Should().Be("João Editado");
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenDoesNotExist()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new UpdateUserCommandHandler(db);

        var command = new UpdateUserCommand(Guid.NewGuid(), "Teste", true);
        var act = async () => await handler.HandleAsync(command);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
