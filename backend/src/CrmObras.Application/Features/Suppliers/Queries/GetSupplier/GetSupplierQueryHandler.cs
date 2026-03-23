using CrmObras.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Suppliers.Queries.GetSupplier;

public record GetSupplierQuery(Guid Id);

public class GetSupplierQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<SupplierDto> HandleAsync(GetSupplierQuery query, CancellationToken cancellationToken = default)
    {
        var supplier = await dbContext.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == query.Id, cancellationToken);
            
        if (supplier == null) throw new InvalidOperationException("Fornecedor não encontrado.");

        return new SupplierDto(supplier.Id, supplier.Name, supplier.Contact);
    }
}
