using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Costs.Commands.CreateExpense;

public record CreateExpenseCommand(Guid WorkId, int CostType, decimal Amount, string Description)
{
    public static CreateExpenseCommand FromRequest(CreateExpenseRequest request) =>
        new(request.WorkId, request.CostType, request.Amount, request.Description);
}

