using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.Abstractions.Storage;
using CrmObras.Domain.Entities;

namespace CrmObras.Application.Features.Documents.Commands.UploadDocument;

public class UploadDocumentCommandHandler(IApplicationDbContext dbContext, IFileStorageService storageService)
{
    public async Task<Guid> HandleAsync(UploadDocumentCommand command, CancellationToken cancellationToken = default)
    {
        UploadDocumentCommandValidator.Validate(command);

        var path = await storageService.SaveAsync(command.Stream, command.FileName, cancellationToken);
        var document = new Document
        {
            WorkId = command.WorkId,
            DocumentCategoryId = command.CategoryId,
            FileName = command.FileName,
            ContentType = command.ContentType,
            StoragePath = path
        };

        dbContext.Documents.Add(document);
        await dbContext.SaveChangesAsync(cancellationToken);
        return document.Id;
    }
}

