using CrmObras.Application.Abstractions.Auth;
using CrmObras.Application.Abstractions.Storage;
using CrmObras.Domain.Entities;

namespace CrmObras.Application.Tests.Common;

public class FakeJwtTokenGenerator : IJwtTokenGenerator
{
    public string GenerateToken(User user) => $"token-{user.Email}";
}

public class FakePasswordHasher : IPasswordHasher
{
    public string Hash(string password) => $"hashed-{password}";
    public bool Verify(string password, string passwordHash) => Hash(password) == passwordHash;
}

public class FakeFileStorageService : IFileStorageService
{
    public Task<string> SaveAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
        => Task.FromResult($"uploads/{fileName}");
}
