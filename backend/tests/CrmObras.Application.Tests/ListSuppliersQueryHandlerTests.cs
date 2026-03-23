using FluentAssertions;
using CrmObras.Application.Features.Suppliers.Queries.ListSuppliers;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class ListSuppliersQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnSuppliers()
    {
        await using var db = TestDbContextFactory.Create();
        db.Suppliers.Add(new Supplier { Name = "Forn 1", Contact = "A" });
        db.Suppliers.Add(new Supplier { Name = "Forn 2", Contact = "B" });
        await db.SaveChangesAsync();

        var handler = new ListSuppliersQueryHandler(db);
        var result = await handler.HandleAsync(new ListSuppliersQuery());

        result.Should().HaveCount(2);
    }
}
