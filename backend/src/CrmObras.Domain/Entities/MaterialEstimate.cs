using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class MaterialEstimate : BaseEntity
{
    public Guid WorkProjectId { get; set; }
    public Guid MaterialId { get; set; }
    public decimal Quantity { get; set; }
    public decimal EstimatedCost { get; set; }
}
