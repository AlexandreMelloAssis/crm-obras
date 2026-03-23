using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Suppliers.Queries.GetSupplier;
using CrmObras.Application.Features.Suppliers.Queries.ListSuppliers;
using CrmObras.Application.Features.Suppliers.Commands.CreateSupplier;
using CrmObras.Application.Features.Suppliers.Commands.UpdateSupplier;
using CrmObras.Application.Features.Suppliers.Commands.DeleteSupplier;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/suppliers")]
public class SuppliersController(
    GetSupplierQueryHandler getSupplierQueryHandler,
    ListSuppliersQueryHandler listSuppliersQueryHandler,
    CreateSupplierCommandHandler createSupplierCommandHandler,
    UpdateSupplierCommandHandler updateSupplierCommandHandler,
    DeleteSupplierCommandHandler deleteSupplierCommandHandler) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<SupplierDto>> List(CancellationToken cancellationToken) =>
        listSuppliersQueryHandler.HandleAsync(new ListSuppliersQuery(), cancellationToken);

    [HttpGet("{id}")]
    public Task<SupplierDto> Get(Guid id, CancellationToken cancellationToken) =>
        getSupplierQueryHandler.HandleAsync(new GetSupplierQuery(id), cancellationToken);

    [HttpPost]
    public Task<SupplierDto> Create([FromBody] CreateSupplierRequest request, CancellationToken cancellationToken) =>
        createSupplierCommandHandler.HandleAsync(new CreateSupplierCommand(request.Name, request.Contact), cancellationToken);

    [HttpPut("{id}")]
    public Task<SupplierDto> Update(Guid id, [FromBody] UpdateSupplierRequest request, CancellationToken cancellationToken) =>
        updateSupplierCommandHandler.HandleAsync(new UpdateSupplierCommand(id, request.Name, request.Contact), cancellationToken);

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await deleteSupplierCommandHandler.HandleAsync(new DeleteSupplierCommand(id), cancellationToken);
        return NoContent();
    }
}
