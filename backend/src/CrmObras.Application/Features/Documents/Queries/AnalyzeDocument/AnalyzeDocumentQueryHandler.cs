using CrmObras.Application.Abstractions.Documents;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Documents.Analysis;
using CrmObras.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Features.Documents.Queries.AnalyzeDocument;

public class AnalyzeDocumentQueryHandler(
    IApplicationDbContext dbContext,
    IDocumentTextExtractionService textExtractionService,
    IEnumerable<IDocumentAnalysisParser> parsers)
{
    public async Task<DocumentAnalysisDto> HandleAsync(
        AnalyzeDocumentQuery query,
        CancellationToken cancellationToken = default)
    {
        var document = await dbContext.Documents
            .Include(x => x.DocumentCategory)
            .FirstOrDefaultAsync(x => x.Id == query.DocumentId, cancellationToken)
            ?? throw new InvalidOperationException("Documento nao encontrado.");

        var category = document.DocumentCategory
            ?? throw new InvalidOperationException("Categoria do documento nao encontrada.");

        var extraction = await textExtractionService.ExtractAsync(
            document.StoragePath,
            document.ContentType,
            document.FileName,
            cancellationToken);

        var context = new DocumentAnalysisContext(
            document.Id,
            document.FileName,
            category.Name,
            category.Type,
            ResolveWorkflow(category.Name, category.Type),
            extraction.Mode,
            extraction.RawText,
            extraction.Preview);

        var parser = parsers.FirstOrDefault(item => item.CanHandle(context))
            ?? throw new InvalidOperationException("Nenhum parser disponivel para esta categoria de documento.");

        var result = parser.Parse(context);

        return new DocumentAnalysisDto(
            document.Id,
            document.FileName,
            category.Name,
            context.Workflow,
            extraction.Mode,
            result.ParserName,
            result.Confidence,
            result.Summary,
            result.Discipline,
            extraction.Preview,
            result.Fields,
            result.Items,
            result.Recommendations);
    }

    private static string ResolveWorkflow(string name, DocumentCategoryType type)
    {
        var normalized = name.Trim().ToLowerInvariant();

        if (type == DocumentCategoryType.Invoice)
        {
            return "cost";
        }

        if (type == DocumentCategoryType.Budget || type == DocumentCategoryType.NegotiationPrint)
        {
            return "quotation";
        }

        if (type == DocumentCategoryType.TechnicalBlueprint)
        {
            return "materials";
        }

        if (normalized.Contains("nota") || normalized.Contains("custo") || normalized.Contains("despesa"))
        {
            return "cost";
        }

        if (normalized.Contains("orc") || normalized.Contains("fornecedor") || normalized.Contains("negoci"))
        {
            return "quotation";
        }

        if (normalized.Contains("planta")
            || normalized.Contains("projeto")
            || normalized.Contains("arquitet")
            || normalized.Contains("eletric")
            || normalized.Contains("hidraul")
            || normalized.Contains("gesso")
            || normalized.Contains("marmor")
            || normalized.Contains("pintura"))
        {
            return "materials";
        }

        return "reference";
    }
}
