namespace CrmObras.Application.DTOs;

public record AuthRequest(string Email, string Password);
public record AuthResponse(string Token, string FullName, string Email);
public record RegisterRequest(string FullName, string Email, string Password);
public record UserDto(Guid Id, string FullName, string Email, bool IsActive);
public record CreateWorkRequest(string Name, string Address);
public record UpdateWorkRequest(string Name, string Address, string Status);
public record WorkDto(Guid Id, string Name, string Address, string Status);
public record CreateStageRequest(Guid WorkId, string Name, string? Description);
public record CreateMaterialRequest(string Name, string Unit, int Category);
public record MaterialDto(Guid Id, string Name, string Unit, string Category);
public record CreateExpenseRequest(Guid WorkId, int CostType, decimal Amount, string Description);
public record CostSummaryDto(Guid WorkId, decimal Total, Dictionary<string, decimal> ByType);
public record CreateSupplierRequest(string Name, string? Contact);
public record UpdateSupplierRequest(string Name, string? Contact);
public record SupplierDto(Guid Id, string Name, string? Contact);

