using Microsoft.Extensions.Configuration;
using CrmObras.Application.Abstractions.Storage;

namespace CrmObras.Infrastructure.Storage;

public class LocalFileStorageService(IConfiguration configuration) : IFileStorageService
{
    public async Task<string> SaveAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var root = configuration["Storage:RootPath"] ?? "uploads";
        Directory.CreateDirectory(root);
        var safeName = $"{Guid.NewGuid()}-{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(root, safeName);

        await using var output = File.Create(fullPath);
        await fileStream.CopyToAsync(output, cancellationToken);
        return fullPath;
    }
}
