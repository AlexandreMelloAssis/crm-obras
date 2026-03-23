using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Suppliers.Commands.UpdateSupplier;

public record UpdateSupplierCommand(Guid Id, string Name, string? Contact);

public class UpdateSupplierCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<SupplierDto> HandleAsync(UpdateSupplierCommand command, CancellationToken cancellationToken = default)
    {
        var supplier = await dbContext.Suppliers.FindAsync(new object[] { command.Id }, cancellationToken);
        if (supplier == null) throw new InvalidOperationException("Fornecedor não encontrado.");

        supplier.Name = command.Name;
        supplier.Contact = command.Contact;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new SupplierDto(supplier.Id, supplier.Name, supplier.Contact);
    }
}
