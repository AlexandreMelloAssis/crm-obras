using FluentAssertions;
using CrmObras.Application.Features.Suppliers.Commands.CreateSupplier;
using CrmObras.Application.Tests.Common;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Tests;

public class CreateSupplierCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldCreateSupplier()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateSupplierCommandHandler(db);

        var result = await handler.HandleAsync(new CreateSupplierCommand("Novo Forn", "Contato Novo"));

        var dbSupplier = await db.Suppliers.FirstOrDefaultAsync(s => s.Id == result.Id);
        
        result.Should().NotBeNull();
        result.Name.Should().Be("Novo Forn");
        dbSupplier.Should().NotBeNull();
        dbSupplier!.Name.Should().Be("Novo Forn");
    }
}
