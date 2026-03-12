using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class WorkStage : BaseEntity
{
    public Guid WorkProjectId { get; set; }
    public WorkProject? WorkProject { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkStageStatus Status { get; set; } = WorkStageStatus.Pending;
}
