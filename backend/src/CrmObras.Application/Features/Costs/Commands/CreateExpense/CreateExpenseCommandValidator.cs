namespace CrmObras.Application.Features.Costs.Commands.CreateExpense;

public static class CreateExpenseCommandValidator
{
    public static void Validate(CreateExpenseCommand command)
    {
        if (command.WorkProjectId == Guid.Empty)
            throw new InvalidOperationException("Todo custo deve ser vinculado a uma obra.");

        if (command.Amount <= 0)
            throw new InvalidOperationException("Valor do custo deve ser maior que zero.");

        if (string.IsNullOrWhiteSpace(command.Description))
            throw new InvalidOperationException("Descrição do custo é obrigatória.");
    }
}
