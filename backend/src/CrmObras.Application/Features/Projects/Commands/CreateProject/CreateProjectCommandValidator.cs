namespace CrmObras.Application.Features.Projects.Commands.CreateProject;

public static class CreateProjectCommandValidator
{
    public static void Validate(CreateProjectCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Name) ||
            string.IsNullOrWhiteSpace(command.Address) ||
            string.IsNullOrWhiteSpace(command.Responsible))
        {
            throw new InvalidOperationException("Obra precisa de nome, endereço e responsável.");
        }
    }
}
