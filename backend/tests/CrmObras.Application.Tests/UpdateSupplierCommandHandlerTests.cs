using FluentAssertions;
using CrmObras.Application.Features.Suppliers.Commands.UpdateSupplier;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class UpdateSupplierCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldUpdateSupplier_WhenExists()
    {
        await using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        db.Suppliers.Add(new Supplier { Id = supplierId, Name = "Forn Antigo", Contact = "Antigo" });
        await db.SaveChangesAsync();

        var handler = new UpdateSupplierCommandHandler(db);
        var command = new UpdateSupplierCommand(supplierId, "Forn Editado", "Editado");
        
        var result = await handler.HandleAsync(command);

        var updatedSupplier = await db.Suppliers.FindAsync(supplierId);
        updatedSupplier.Should().NotBeNull();
        updatedSupplier!.Name.Should().Be("Forn Editado");
        result.Name.Should().Be("Forn Editado");
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenDoesNotExist()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new UpdateSupplierCommandHandler(db);

        var command = new UpdateSupplierCommand(Guid.NewGuid(), "Teste", null);
        var act = async () => await handler.HandleAsync(command);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
