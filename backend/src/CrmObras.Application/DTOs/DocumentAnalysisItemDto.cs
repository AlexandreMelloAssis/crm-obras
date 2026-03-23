namespace CrmObras.Application.DTOs;

public record DocumentAnalysisItemDto(
    string Name,
    decimal? Quantity,
    string? Unit,
    string Source,
    string? Notes);
