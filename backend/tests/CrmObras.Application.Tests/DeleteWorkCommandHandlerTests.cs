using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Features.Works.Commands.DeleteWork;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class DeleteWorkCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldDeleteWork_WhenWorkExists()
    {
        // Arrange
        await using var _dbContext = TestDbContextFactory.Create();
        var _handler = new DeleteWorkCommandHandler(_dbContext);

        var workId = Guid.NewGuid();
        var work = new Work { Id = workId, Name = "Obra A", Address = "Endereço A" };
        _dbContext.Works.Add(work);
        await _dbContext.SaveChangesAsync(CancellationToken.None);

        var command = new DeleteWorkCommand(workId);

        // Act
        await _handler.HandleAsync(command, CancellationToken.None);

        // Assert
        var deletedWork = await _dbContext.Works.FindAsync(workId);
        Assert.Null(deletedWork);
    }

    [Fact]
    public async Task HandleAsync_ShouldThrowException_WhenWorkDoesNotExist()
    {
        // Arrange
        await using var _dbContext = TestDbContextFactory.Create();
        var _handler = new DeleteWorkCommandHandler(_dbContext);
        var command = new DeleteWorkCommand(Guid.NewGuid());

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.HandleAsync(command, CancellationToken.None));
    }
}
