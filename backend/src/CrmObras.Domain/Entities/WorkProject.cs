using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class WorkProject : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Responsible { get; set; } = string.Empty;
    public WorkProjectStatus Status { get; set; } = WorkProjectStatus.Planning;
    public ICollection<WorkStage> Stages { get; set; } = new List<WorkStage>();
}
