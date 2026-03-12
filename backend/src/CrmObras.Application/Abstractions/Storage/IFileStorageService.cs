namespace CrmObras.Application.Abstractions.Storage;

public interface IFileStorageService
{
    Task<string> SaveAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
}
