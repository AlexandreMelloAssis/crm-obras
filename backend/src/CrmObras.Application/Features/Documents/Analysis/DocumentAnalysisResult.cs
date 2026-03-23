using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public record DocumentAnalysisResult(
    string ParserName,
    string Confidence,
    string Summary,
    string? Discipline,
    IReadOnlyList<DocumentAnalysisFieldDto> Fields,
    IReadOnlyList<DocumentAnalysisItemDto> Items,
    IReadOnlyList<string> Recommendations);
