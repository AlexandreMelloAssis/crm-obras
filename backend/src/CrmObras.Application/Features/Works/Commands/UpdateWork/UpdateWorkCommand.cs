using CrmObras.Application.DTOs;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Works.Commands.UpdateWork;

public record UpdateWorkCommand(Guid Id, string Name, string Address, WorkStatus Status)
{
    public static UpdateWorkCommand FromRequest(Guid id, UpdateWorkRequest request) =>
        new(id, request.Name, request.Address, Enum.Parse<WorkStatus>(request.Status, ignoreCase: true));
}
