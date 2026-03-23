namespace CrmObras.Application.Features.Documents.Commands.UploadDocument;

public static class UploadDocumentCommandValidator
{
    public static void Validate(UploadDocumentCommand command)
    {
        if (command.WorkId == Guid.Empty)
            throw new InvalidOperationException("Documento deve estar vinculado a uma obra.");

        if (command.CategoryId == Guid.Empty)
            throw new InvalidOperationException("Todo documento precisa de categoria.");

        if (string.IsNullOrWhiteSpace(command.FileName))
            throw new InvalidOperationException("Nome do arquivo é obrigatório.");
    }
}

