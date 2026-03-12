using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class Expense : BaseEntity
{
    public Guid WorkProjectId { get; set; }
    public WorkProject? WorkProject { get; set; }
    public CostType CostType { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CompetenceDate { get; set; } = DateTime.UtcNow;
}
