namespace CrmObras.Application.Abstractions.Documents;

public interface IDocumentTextExtractionService
{
    Task<DocumentTextExtractionResult> ExtractAsync(
        string storagePath,
        string contentType,
        string fileName,
        CancellationToken cancellationToken = default);
}

public record DocumentTextExtractionResult(
    string Mode,
    string RawText,
    string Preview);
