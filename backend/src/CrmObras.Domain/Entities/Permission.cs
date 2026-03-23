using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class Permission : BaseEntity
{
    public string SystemName { get; set; } = string.Empty; // e.g., "Work.ManageAccess"
    public string Description { get; set; } = string.Empty;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
