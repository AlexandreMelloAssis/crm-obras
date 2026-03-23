using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;

namespace CrmObras.Api.Authorization;

public class WorkPermissionHandler(IApplicationDbContext dbContext, IHttpContextAccessor httpContextAccessor) : AuthorizationHandler<WorkPermissionRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, WorkPermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
            return;

        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return;

        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null)
            return;

        // Tenta obter o workId da rota ou do header
        string? workIdStr = null;
        
        if (httpContext.Request.Headers.TryGetValue("X-Work-Id", out var headerValue))
        {
            workIdStr = headerValue.FirstOrDefault();
        }
        else if (httpContext.Request.RouteValues.TryGetValue("workId", out var routeValue) && routeValue != null)
        {
            workIdStr = routeValue.ToString();
        }

        if (string.IsNullOrEmpty(workIdStr) || !Guid.TryParse(workIdStr, out var workId))
        {
            // Se não informou WorkId, não pode validar acesso por obra
            return;
        }

        // Verifica se o usuário tem acesso à Obra e tem a permissão exigida
        var hasPermission = await dbContext.WorkUsers
            .Include(wu => wu.Role)
            .ThenInclude(r => r!.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .AnyAsync(wu => 
                wu.UserId == userId && 
                wu.WorkId == workId && 
                wu.Role != null &&
                wu.Role.RolePermissions.Any(rp => rp.Permission != null && rp.Permission.SystemName == requirement.Permission));

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}
