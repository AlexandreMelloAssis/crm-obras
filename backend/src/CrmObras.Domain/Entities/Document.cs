using CrmObras.Domain.Common;
using CrmObras.Domain.Enums;

namespace CrmObras.Domain.Entities;

public class Document : BaseEntity
{
    public Guid WorkId { get; set; }
    public Work? Work { get; set; }
    public Guid DocumentCategoryId { get; set; }
    public DocumentCategory? DocumentCategory { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; } = DocumentStatus.PendingReview;
}

