namespace CrmObras.Application.DTOs;

public record DocumentCategoryDto(
    Guid Id,
    string Name,
    string Type,
    string Workflow);
