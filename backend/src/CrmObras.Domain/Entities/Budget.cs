using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class Budget : BaseEntity
{
    public Guid WorkId { get; set; }
    public BudgetStatus Status { get; set; } = BudgetStatus.Draft;
    public decimal TotalEstimated { get; set; }
}

