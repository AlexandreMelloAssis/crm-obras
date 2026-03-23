using FluentAssertions;
using CrmObras.Application.Features.Suppliers.Commands.DeleteSupplier;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class DeleteSupplierCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldDeleteSupplier_WhenExists()
    {
        await using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        db.Suppliers.Add(new Supplier { Id = supplierId, Name = "Forn Apagar", Contact = "A" });
        await db.SaveChangesAsync();

        var handler = new DeleteSupplierCommandHandler(db);
        await handler.HandleAsync(new DeleteSupplierCommand(supplierId));

        var deletedSupplier = await db.Suppliers.FindAsync(supplierId);
        deletedSupplier.Should().BeNull();
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenDoesNotExist()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new DeleteSupplierCommandHandler(db);

        var act = async () => await handler.HandleAsync(new DeleteSupplierCommand(Guid.NewGuid()));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
