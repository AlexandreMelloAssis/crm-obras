using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class SupplierQuote : BaseEntity
{
    public Guid SupplierId { get; set; }
    public Guid MaterialId { get; set; }
    public decimal UnitPrice { get; set; }
    public DateTime ValidUntil { get; set; }
}
