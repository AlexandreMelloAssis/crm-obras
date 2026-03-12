using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class Material : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = "un";
    public MaterialCategory Category { get; set; }
}
