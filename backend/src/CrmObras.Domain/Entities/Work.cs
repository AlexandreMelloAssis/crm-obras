using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class Work : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public WorkStatus Status { get; set; } = WorkStatus.Planning;
    
    public decimal Budget { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public ICollection<WorkUser> WorkUsers { get; set; } = new List<WorkUser>();
    public ICollection<WorkStage> Stages { get; set; } = new List<WorkStage>();
}
