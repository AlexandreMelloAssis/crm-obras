using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class WorkUser : BaseEntity
{
    public Guid WorkId { get; set; }
    public Work? Work { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
}
