using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class DocumentCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DocumentCategoryType Type { get; set; }
}
