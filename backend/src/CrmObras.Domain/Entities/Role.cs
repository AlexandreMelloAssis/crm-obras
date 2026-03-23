using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsSystemDefault { get; set; } = false;

    // Relacionamentos
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<WorkUser> WorkUsers { get; set; } = new List<WorkUser>();
}
