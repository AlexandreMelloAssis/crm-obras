using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string EntityName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
}
