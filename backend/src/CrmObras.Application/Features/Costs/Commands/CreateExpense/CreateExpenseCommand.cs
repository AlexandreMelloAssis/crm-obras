using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Costs.Commands.CreateExpense;

public record CreateExpenseCommand(Guid WorkProjectId, int CostType, decimal Amount, string Description)
{
    public static CreateExpenseCommand FromRequest(CreateExpenseRequest request) =>
        new(request.WorkProjectId, request.CostType, request.Amount, request.Description);
}
