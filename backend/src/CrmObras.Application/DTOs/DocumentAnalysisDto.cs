namespace CrmObras.Application.DTOs;

public record DocumentAnalysisDto(
    Guid DocumentId,
    string FileName,
    string CategoryName,
    string Workflow,
    string ExtractionMode,
    string ParserName,
    string Confidence,
    string Summary,
    string? Discipline,
    string RawTextPreview,
    IReadOnlyList<DocumentAnalysisFieldDto> Fields,
    IReadOnlyList<DocumentAnalysisItemDto> Items,
    IReadOnlyList<string> Recommendations);
