using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class LaborCost : BaseEntity
{
    public Guid ExpenseId { get; set; }
    public string TeamName { get; set; } = string.Empty;
}
