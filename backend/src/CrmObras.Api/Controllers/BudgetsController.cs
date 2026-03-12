using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/budgets")]
public class BudgetsController : ControllerBase
{
    [HttpGet]
    public IActionResult List() => Ok(new { message = "Endpoint inicial de budgets pronto para expansão." });
}
