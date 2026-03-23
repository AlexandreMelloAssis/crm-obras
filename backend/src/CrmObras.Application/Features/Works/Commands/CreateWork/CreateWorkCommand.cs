using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Works.Commands.CreateWork;

public record CreateWorkCommand(string Name, string Address)
{
    public static CreateWorkCommand FromRequest(CreateWorkRequest request) =>
        new(request.Name, request.Address);
}
