using FluentAssertions;
using CrmObras.Application.Features.Suppliers.Queries.GetSupplier;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class GetSupplierQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnSupplier_WhenExists()
    {
        await using var db = TestDbContextFactory.Create();
        var supplierId = Guid.NewGuid();
        db.Suppliers.Add(new Supplier { Id = supplierId, Name = "Fornecedor 1", Contact = "Teste" });
        await db.SaveChangesAsync();

        var handler = new GetSupplierQueryHandler(db);
        var result = await handler.HandleAsync(new GetSupplierQuery(supplierId));

        result.Should().NotBeNull();
        result.Name.Should().Be("Fornecedor 1");
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenDoesNotExist()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new GetSupplierQueryHandler(db);

        var act = async () => await handler.HandleAsync(new GetSupplierQuery(Guid.NewGuid()));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
