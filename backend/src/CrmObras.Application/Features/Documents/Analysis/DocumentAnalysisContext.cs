using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Documents.Analysis;

public record DocumentAnalysisContext(
    Guid DocumentId,
    string FileName,
    string CategoryName,
    DocumentCategoryType CategoryType,
    string Workflow,
    string ExtractionMode,
    string RawText,
    string RawTextPreview);
