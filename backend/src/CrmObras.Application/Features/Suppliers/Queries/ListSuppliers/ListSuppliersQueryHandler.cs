using CrmObras.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Suppliers.Queries.ListSuppliers;

public record ListSuppliersQuery();

public class ListSuppliersQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<SupplierDto>> HandleAsync(ListSuppliersQuery query, CancellationToken cancellationToken = default)
    {
        return await dbContext.Suppliers
            .AsNoTracking()
            .Select(s => new SupplierDto(s.Id, s.Name, s.Contact))
            .ToListAsync(cancellationToken);
    }
}
