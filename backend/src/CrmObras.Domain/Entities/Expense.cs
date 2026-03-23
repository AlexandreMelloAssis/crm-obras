using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class Expense : BaseEntity
{
    public Guid WorkId { get; set; }
    public Work? Work { get; set; }
    public CostType CostType { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CompetenceDate { get; set; } = DateTime.UtcNow;
}

