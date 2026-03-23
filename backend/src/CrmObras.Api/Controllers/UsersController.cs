using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/users")]
public class UsersController(
    CrmObras.Application.Features.Users.Queries.ListUsers.ListUsersQueryHandler listUsersQueryHandler,
    CrmObras.Application.Features.Users.Queries.GetUser.GetUserQueryHandler getUserQueryHandler,
    CrmObras.Application.Features.Users.Commands.UpdateUser.UpdateUserCommandHandler updateUserCommandHandler,
    CrmObras.Application.Features.Users.Commands.DeleteUser.DeleteUserCommandHandler deleteUserCommandHandler) : ControllerBase
{
    [HttpGet("me")]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        var name = User.FindFirstValue("name");
        return Ok(new { email, name });
    }

    [HttpGet]
    public Task<IReadOnlyList<CrmObras.Application.DTOs.UserDto>> List(CancellationToken cancellationToken) =>
        listUsersQueryHandler.HandleAsync(new CrmObras.Application.Features.Users.Queries.ListUsers.ListUsersQuery(), cancellationToken);

    [HttpGet("{id}")]
    public Task<CrmObras.Application.DTOs.UserDto> Get(Guid id, CancellationToken cancellationToken) =>
        getUserQueryHandler.HandleAsync(new CrmObras.Application.Features.Users.Queries.GetUser.GetUserQuery(id), cancellationToken);

    [HttpPut("{id}")]
    public Task<CrmObras.Application.DTOs.UserDto> Update(Guid id, [FromBody] CrmObras.Application.Features.Users.Commands.UpdateUser.UpdateUserCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) throw new InvalidOperationException("ID mismatch.");
        return updateUserCommandHandler.HandleAsync(command, cancellationToken);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await deleteUserCommandHandler.HandleAsync(new CrmObras.Application.Features.Users.Commands.DeleteUser.DeleteUserCommand(id), cancellationToken);
        return NoContent();
    }
}
