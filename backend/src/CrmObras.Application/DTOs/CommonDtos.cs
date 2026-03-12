namespace CrmObras.Application.DTOs;

public record AuthRequest(string Email, string Password);
public record AuthResponse(string Token, string FullName, string Email);
public record RegisterRequest(string FullName, string Email, string Password);
public record CreateProjectRequest(string Name, string Address, string Responsible);
public record ProjectDto(Guid Id, string Name, string Address, string Responsible, string Status);
public record CreateStageRequest(Guid WorkProjectId, string Name, string? Description);
public record CreateMaterialRequest(string Name, string Unit, int Category);
public record MaterialDto(Guid Id, string Name, string Unit, string Category);
public record CreateExpenseRequest(Guid WorkProjectId, int CostType, decimal Amount, string Description);
public record CostSummaryDto(Guid WorkProjectId, decimal Total, Dictionary<string, decimal> ByType);
