using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class BudgetItem : BaseEntity
{
    public Guid BudgetId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
