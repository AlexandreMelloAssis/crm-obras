using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Projects.Commands.CreateProject;
using CrmObras.Application.Features.Projects.Queries.ListProjects;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/projects")]
public class ProjectsController(
    CreateProjectCommandHandler createProjectCommandHandler,
    ListProjectsQueryHandler listProjectsQueryHandler) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ProjectDto>> List(CancellationToken cancellationToken) =>
        listProjectsQueryHandler.HandleAsync(new ListProjectsQuery(), cancellationToken);

    [HttpPost]
    public Task<ProjectDto> Create([FromBody] CreateProjectRequest request, CancellationToken cancellationToken) =>
        createProjectCommandHandler.HandleAsync(CreateProjectCommand.FromRequest(request), cancellationToken);
}
