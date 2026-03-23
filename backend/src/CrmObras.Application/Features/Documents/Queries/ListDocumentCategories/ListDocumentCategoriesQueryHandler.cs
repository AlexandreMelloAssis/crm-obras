using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Features.Documents.Queries.ListDocumentCategories;

public class ListDocumentCategoriesQueryHandler(IApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<DocumentCategoryDto>> HandleAsync(
        ListDocumentCategoriesQuery query,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.DocumentCategories
            .OrderBy(x => x.Name)
            .Select(x => new DocumentCategoryDto(
                x.Id,
                x.Name,
                x.Type.ToString(),
                ResolveWorkflow(x.Name, x.Type)))
            .ToListAsync(cancellationToken);
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
