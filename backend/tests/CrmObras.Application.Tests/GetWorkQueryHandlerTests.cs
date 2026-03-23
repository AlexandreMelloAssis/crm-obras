using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Features.Works.Queries.GetWork;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class GetWorkQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnWork_WhenWorkExists()
    {
        // Arrange
        await using var _dbContext = TestDbContextFactory.Create();
        var _handler = new GetWorkQueryHandler(_dbContext);
        
        var workId = Guid.NewGuid();
        var work = new Work { Id = workId, Name = "Obra A", Address = "Endereço A" };
        _dbContext.Works.Add(work);
        await _dbContext.SaveChangesAsync(CancellationToken.None);

        var query = new GetWorkQuery(workId);

        // Act
        var result = await _handler.HandleAsync(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(workId, result.Id);
        Assert.Equal("Obra A", result.Name);
    }

    [Fact]
    public async Task HandleAsync_ShouldThrowException_WhenWorkDoesNotExist()
    {
        // Arrange
        await using var _dbContext = TestDbContextFactory.Create();
        var _handler = new GetWorkQueryHandler(_dbContext);
        var query = new GetWorkQuery(Guid.NewGuid());

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.HandleAsync(query, CancellationToken.None));
    }
}
