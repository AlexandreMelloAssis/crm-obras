using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Works.Commands.CreateWork;
using CrmObras.Application.Features.Works.Queries.ListWorks;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/works")]
public class WorksController(
    CreateWorkCommandHandler createWorkCommandHandler,
    ListWorksQueryHandler listWorksQueryHandler,
    CrmObras.Application.Features.Works.Queries.GetWork.GetWorkQueryHandler getWorkQueryHandler,
    CrmObras.Application.Features.Works.Commands.UpdateWork.UpdateWorkCommandHandler updateWorkCommandHandler,
    CrmObras.Application.Features.Works.Commands.DeleteWork.DeleteWorkCommandHandler deleteWorkCommandHandler) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<WorkDto>> List(CancellationToken cancellationToken) =>
        listWorksQueryHandler.HandleAsync(new ListWorksQuery(), cancellationToken);

    [HttpGet("{id}")]
    public Task<WorkDto> Get(Guid id, CancellationToken cancellationToken) =>
        getWorkQueryHandler.HandleAsync(new CrmObras.Application.Features.Works.Queries.GetWork.GetWorkQuery(id), cancellationToken);

    [HttpPost]
    public Task<WorkDto> Create([FromBody] CreateWorkRequest request, CancellationToken cancellationToken) =>
        createWorkCommandHandler.HandleAsync(CreateWorkCommand.FromRequest(request), cancellationToken);

    [HttpPut("{id}")]
    public Task<WorkDto> Update(Guid id, [FromBody] UpdateWorkRequest request, CancellationToken cancellationToken) =>
        updateWorkCommandHandler.HandleAsync(CrmObras.Application.Features.Works.Commands.UpdateWork.UpdateWorkCommand.FromRequest(id, request), cancellationToken);

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await deleteWorkCommandHandler.HandleAsync(new CrmObras.Application.Features.Works.Commands.DeleteWork.DeleteWorkCommand(id), cancellationToken);
        return NoContent();
    }
}
