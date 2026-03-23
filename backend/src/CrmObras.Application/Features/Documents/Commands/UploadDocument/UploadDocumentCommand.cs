namespace CrmObras.Application.Features.Documents.Commands.UploadDocument;

public record UploadDocumentCommand(
    Guid WorkId,
    Guid CategoryId,
    string FileName,
    string ContentType,
    Stream Stream);

