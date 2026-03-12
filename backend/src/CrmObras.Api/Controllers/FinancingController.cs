using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/financing")]
public class FinancingController : ControllerBase
{
    [HttpGet]
    public IActionResult List() => Ok(new { message = "Endpoint inicial de financiamento pronto para expansão." });
}
