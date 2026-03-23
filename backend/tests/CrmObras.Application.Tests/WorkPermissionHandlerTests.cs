using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Security.Claims;
using FluentAssertions;
using CrmObras.Api.Authorization;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class WorkPermissionHandlerTests
{
    [Fact]
    public async Task HandleRequirementAsync_ShouldSucceed_WhenUserHasPermission()
    {
        // Arrange
        await using var db = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();
        var workId = Guid.NewGuid();

        var permission = new CrmObras.Domain.Entities.Permission { SystemName = "Works.Update" };
        var role = new Role { Name = "Admin" };
        var rolePermission = new RolePermission { RoleId = role.Id, PermissionId = permission.Id, Role = role, Permission = permission };
        
        var workUser = new WorkUser 
        { 
            UserId = userId, 
            WorkId = workId, 
            Role = role 
        };

        db.Permissions.Add(permission);
        db.Roles.Add(role);
        db.RolePermissions.Add(rolePermission);
        db.WorkUsers.Add(workUser);
        await db.SaveChangesAsync();

        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["X-Work-Id"] = workId.ToString();
        var serviceProvider = new ServiceCollection()
            .AddScoped<CrmObras.Application.Abstractions.Persistence.IApplicationDbContext>(sp => db)
            .BuildServiceProvider();
        httpContext.RequestServices = serviceProvider;

        var accessorMock = new Mock<IHttpContextAccessor>();
        accessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        var handler = new WorkPermissionHandler(db, accessorMock.Object);
        var requirement = new WorkPermissionRequirement("Works.Update");
        
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        var user = new ClaimsPrincipal(identity);
        var authContext = new AuthorizationHandlerContext(new[] { requirement }, user, null);

        // Act
        await handler.HandleAsync(authContext);

        // Assert
        authContext.HasSucceeded.Should().BeTrue();
    }
}
