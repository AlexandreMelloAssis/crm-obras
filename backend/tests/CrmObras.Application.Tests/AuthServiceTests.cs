using FluentAssertions;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Auth;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Entities;
using Xunit;

namespace CrmObras.Application.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_ShouldCreateUserAndReturnToken()
    {
        await using var db = TestDbContextFactory.Create();
        var service = new AuthService(db, new FakeJwtTokenGenerator(), new FakePasswordHasher());

        var result = await service.RegisterAsync(new RegisterRequest("Admin", "admin@crm.com", "123456"));

        result.Token.Should().Be("token-admin@crm.com");
        db.Users.Should().ContainSingle(u => u.Email == "admin@crm.com");
        db.Roles.Should().ContainSingle(r => r.Name == "Admin");
    }

    [Fact]
    public async Task LoginAsync_ShouldThrow_WhenPasswordIsInvalid()
    {
        await using var db = TestDbContextFactory.Create();
        db.Users.Add(new User
        {
            FullName = "Admin",
            Email = "admin@crm.com",
            PasswordHash = "hashed-correct"
        });
        await db.SaveChangesAsync();

        var service = new AuthService(db, new FakeJwtTokenGenerator(), new FakePasswordHasher());
        var act = async () => await service.LoginAsync(new AuthRequest("admin@crm.com", "wrong"));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
