using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserProfile Profile { get; set; } = UserProfile.Viewer;
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
}
