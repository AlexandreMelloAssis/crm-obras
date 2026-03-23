using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Costs.Commands.CreateExpense;

public class CreateExpenseCommandHandler(IApplicationDbContext dbContext)
{
    public async Task<Guid> HandleAsync(CreateExpenseCommand command, CancellationToken cancellationToken = default)
    {
        CreateExpenseCommandValidator.Validate(command);

        var expense = new Expense
        {
            WorkId = command.WorkId,
            CostType = (CostType)command.CostType,
            Amount = command.Amount,
            Description = command.Description
        };

        dbContext.Expenses.Add(expense);
        await dbContext.SaveChangesAsync(cancellationToken);
        return expense.Id;
    }
}

