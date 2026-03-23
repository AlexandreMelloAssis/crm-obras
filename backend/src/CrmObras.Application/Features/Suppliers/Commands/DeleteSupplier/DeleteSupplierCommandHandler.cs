using CrmObras.Application.Abstractions.Persistence;

namespace CrmObras.Application.Features.Suppliers.Commands.DeleteSupplier;

public record DeleteSupplierCommand(Guid Id);

public class DeleteSupplierCommandHandler(IApplicationDbContext dbContext)
{
    public async Task HandleAsync(DeleteSupplierCommand command, CancellationToken cancellationToken = default)
    {
        var supplier = await dbContext.Suppliers.FindAsync(new object[] { command.Id }, cancellationToken);
        if (supplier == null) throw new InvalidOperationException("Fornecedor não encontrado.");

        dbContext.Suppliers.Remove(supplier);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
