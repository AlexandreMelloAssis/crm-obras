using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Materials;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/materials")]
public class MaterialsController(MaterialService service) : ControllerBase
{
    [HttpGet]
    public Task<List<MaterialDto>> List(CancellationToken cancellationToken) => service.ListAsync(cancellationToken);

    [HttpPost]
    public Task<Guid> Create([FromBody] CreateMaterialRequest request, CancellationToken cancellationToken) => service.CreateAsync(request, cancellationToken);
}
