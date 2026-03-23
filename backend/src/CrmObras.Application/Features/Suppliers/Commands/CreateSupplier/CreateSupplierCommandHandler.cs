using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Entities;

namespace CrmObras.Application.Features.Suppliers.Commands.CreateSupplier;

public record CreateSupplierCommand(string Name, string? Contact);

public class CreateSupplierCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<SupplierDto> HandleAsync(CreateSupplierCommand command, CancellationToken cancellationToken = default)
    {
        var supplier = new Supplier
        {
            Name = command.Name,
            Contact = command.Contact
        };

        dbContext.Suppliers.Add(supplier);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new SupplierDto(supplier.Id, supplier.Name, supplier.Contact);
    }
}
