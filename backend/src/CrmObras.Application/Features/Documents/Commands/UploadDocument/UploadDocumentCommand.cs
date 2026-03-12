namespace CrmObras.Application.Features.Documents.Commands.UploadDocument;

public record UploadDocumentCommand(
    Guid WorkProjectId,
    Guid CategoryId,
    string FileName,
    string ContentType,
    Stream Stream);
