using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Costs.Commands.CreateExpense;
using CrmObras.Application.Features.Costs.Queries.GetProjectCostSummary;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/costs")]
public class CostsController(
    CreateExpenseCommandHandler createExpenseCommandHandler,
    GetProjectCostSummaryQueryHandler getProjectCostSummaryQueryHandler) : ControllerBase
{
    [HttpPost]
    public Task<Guid> Create([FromBody] CreateExpenseRequest request, CancellationToken cancellationToken) =>
        createExpenseCommandHandler.HandleAsync(CreateExpenseCommand.FromRequest(request), cancellationToken);

    [HttpGet("{projectId:guid}/summary")]
    public Task<CostSummaryDto> Summary([FromRoute] Guid projectId, CancellationToken cancellationToken) =>
        getProjectCostSummaryQueryHandler.HandleAsync(new GetProjectCostSummaryQuery(projectId), cancellationToken);
}
