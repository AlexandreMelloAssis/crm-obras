namespace CrmObras.Application.Features.Works.Commands.CreateWork;

public static class CreateWorkCommandValidator
{
    public static void Validate(CreateWorkCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Name) ||
            string.IsNullOrWhiteSpace(command.Address))
        {
            throw new InvalidOperationException("Obra precisa de nome e endereço.");
        }
    }
}
