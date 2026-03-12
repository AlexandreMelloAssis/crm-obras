using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class UtilityCost : BaseEntity
{
    public Guid ExpenseId { get; set; }
    public string UtilityType { get; set; } = string.Empty;
}
