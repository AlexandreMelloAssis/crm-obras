using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Features.Works.Commands.UpdateWork;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;
using Xunit;

namespace CrmObras.Application.Tests;

public class UpdateWorkCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldUpdateWork_WhenWorkExists()
    {
        // Arrange
        await using var _dbContext = TestDbContextFactory.Create();
        var _handler = new UpdateWorkCommandHandler(_dbContext);
        
        var workId = Guid.NewGuid();
        var work = new Work { Id = workId, Name = "Obra Antiga", Address = "Endereço Antigo", Status = WorkStatus.Planning };
        _dbContext.Works.Add(work);
        await _dbContext.SaveChangesAsync(CancellationToken.None);

        var command = new UpdateWorkCommand(workId, "Nova Obra", "Novo Endereço", WorkStatus.InProgress);

        // Act
        var result = await _handler.HandleAsync(command, CancellationToken.None);

        // Assert
        var updatedWork = await _dbContext.Works.FindAsync(workId);
        Assert.NotNull(result);
        Assert.NotNull(updatedWork);
        Assert.Equal("Nova Obra", updatedWork.Name);
        Assert.Equal("Novo Endereço", updatedWork.Address);
        Assert.Equal(WorkStatus.InProgress, updatedWork.Status);
    }

    [Fact]
    public async Task HandleAsync_ShouldThrowException_WhenWorkDoesNotExist()
    {
        // Arrange
        await using var _dbContext = TestDbContextFactory.Create();
        var _handler = new UpdateWorkCommandHandler(_dbContext);
        var command = new UpdateWorkCommand(Guid.NewGuid(), "Obra X", "Rua Y", WorkStatus.InProgress);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.HandleAsync(command, CancellationToken.None));
    }
}
