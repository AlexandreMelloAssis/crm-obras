using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CrmObras.Infrastructure.Persistence;

public static class DocumentCategorySeed
{
    private static readonly IReadOnlyList<DocumentCategory> DefaultCategories =
    [
        Create("11111111-1111-1111-1111-111111111111", "Nota fiscal", DocumentCategoryType.Invoice),
        Create("11111111-1111-1111-1111-111111111112", "Comprovante de custo", DocumentCategoryType.Invoice),
        Create("11111111-1111-1111-1111-111111111113", "Orcamento fornecedor", DocumentCategoryType.Budget),
        Create("11111111-1111-1111-1111-111111111114", "Print de negociacao", DocumentCategoryType.NegotiationPrint),
        Create("11111111-1111-1111-1111-111111111115", "Planta arquitetonica", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111116", "Projeto eletrico", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111117", "Projeto hidraulico", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111118", "Projeto de gesso", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111119", "Projeto de marmore", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111120", "Projeto de pintura", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111121", "Memorial descritivo", DocumentCategoryType.TechnicalBlueprint),
        Create("11111111-1111-1111-1111-111111111122", "Contrato", DocumentCategoryType.Other),
        Create("11111111-1111-1111-1111-111111111123", "Cronograma da obra", DocumentCategoryType.Other),
    ];

    public static async Task EnsureSeededAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var existingIds = await dbContext.DocumentCategories
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var missingCategories = DefaultCategories
            .Where(category => !existingIds.Contains(category.Id))
            .ToList();

        if (missingCategories.Count == 0)
        {
            return;
        }

        dbContext.DocumentCategories.AddRange(missingCategories);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static DocumentCategory Create(string id, string name, DocumentCategoryType type) =>
        new()
        {
            Id = Guid.Parse(id),
            Name = name,
            Type = type,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        };
}
