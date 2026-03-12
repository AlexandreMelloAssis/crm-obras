using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Contact { get; set; }
}
