using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Projects.Commands.CreateProject;

public record CreateProjectCommand(string Name, string Address, string Responsible)
{
    public static CreateProjectCommand FromRequest(CreateProjectRequest request) =>
        new(request.Name, request.Address, request.Responsible);
}
