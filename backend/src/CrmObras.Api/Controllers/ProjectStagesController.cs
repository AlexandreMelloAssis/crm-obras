using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.ProjectStages;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/project-stages")]
public class ProjectStagesController(ProjectStageService service) : ControllerBase
{
    [HttpPost]
    public Task<Guid> Create([FromBody] CreateStageRequest request, CancellationToken cancellationToken) =>
        service.CreateAsync(request, cancellationToken);
}
