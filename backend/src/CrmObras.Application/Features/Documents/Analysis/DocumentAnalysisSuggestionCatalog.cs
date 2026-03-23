using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

internal static class DocumentAnalysisSuggestionCatalog
{
    public static IReadOnlyList<DocumentAnalysisItemDto> BuildElectricalSuggestions(string text)
    {
        return BuildSuggestions(
            text,
            "electrical-catalog",
            [
                new CatalogItem("Tomada 2P+T", "un", ["tomada"]),
                new CatalogItem("Interruptor simples", "un", ["interruptor"]),
                new CatalogItem("Luminaria LED", "un", ["luminaria", "ilumin"]),
                new CatalogItem("Quadro de distribuicao", "un", ["quadro"]),
                new CatalogItem("Disjuntor", "un", ["disjuntor"]),
                new CatalogItem("Cabo flexivel", "m", ["cabo"]),
                new CatalogItem("Eletroduto corrugado", "m", ["eletroduto"])
            ]);
    }

    public static IReadOnlyList<DocumentAnalysisItemDto> BuildHydraulicSuggestions(string text)
    {
        return BuildSuggestions(
            text,
            "hydraulic-catalog",
            [
                new CatalogItem("Tubo PVC agua fria", "m", ["agua fria", "tubo"]),
                new CatalogItem("Tubo PVC esgoto", "m", ["esgoto", "tubo"]),
                new CatalogItem("Joelho 90 PVC", "un", ["joelho"]),
                new CatalogItem("Registro de gaveta", "un", ["registro"]),
                new CatalogItem("Ralo", "un", ["ralo"]),
                new CatalogItem("Caixa sifonada", "un", ["caixa sifonada"]),
                new CatalogItem("Conexao PVC", "un", ["conexao", "conexoes"])
            ]);
    }

    public static IReadOnlyList<DocumentAnalysisItemDto> BuildPaintingSuggestions(string text)
    {
        return BuildSuggestions(
            text,
            "painting-catalog",
            [
                new CatalogItem("Tinta acrilica", "l", ["tinta"]),
                new CatalogItem("Massa corrida", "kg", ["massa corrida"]),
                new CatalogItem("Selador", "l", ["selador"]),
                new CatalogItem("Primer", "l", ["primer"]),
                new CatalogItem("Verniz", "l", ["verniz"]),
                new CatalogItem("Lixa", "un", ["lixa"])
            ]);
    }

    public static IReadOnlyList<DocumentAnalysisItemDto> BuildGypsumSuggestions(string text)
    {
        return BuildSuggestions(
            text,
            "gypsum-catalog",
            [
                new CatalogItem("Chapa drywall", "un", ["drywall", "chapa"]),
                new CatalogItem("Perfil metalico", "m", ["perfil"]),
                new CatalogItem("Tabica", "m", ["tabica"]),
                new CatalogItem("Massa para gesso", "kg", ["massa"]),
                new CatalogItem("Forro de gesso", "m2", ["forro", "gesso"]),
                new CatalogItem("Sanca", "m", ["sanca"])
            ]);
    }

    public static IReadOnlyList<DocumentAnalysisItemDto> BuildMarbleSuggestions(string text)
    {
        return BuildSuggestions(
            text,
            "marble-catalog",
            [
                new CatalogItem("Bancada de marmore", "m2", ["bancada"]),
                new CatalogItem("Soleira", "m", ["soleira"]),
                new CatalogItem("Peitoril", "m", ["peitoril"]),
                new CatalogItem("Granito", "m2", ["granito"]),
                new CatalogItem("Marmore", "m2", ["marmore"]),
                new CatalogItem("Peca de pedra especial", "un", ["pedra"])
            ]);
    }

    public static IReadOnlyList<DocumentAnalysisItemDto> BuildArchitecturalSuggestions(string text)
    {
        return BuildSuggestions(
            text,
            "architectural-catalog",
            [
                new CatalogItem("Porta", "un", ["porta"]),
                new CatalogItem("Janela", "un", ["janela"]),
                new CatalogItem("Piso", "m2", ["piso"]),
                new CatalogItem("Revestimento", "m2", ["revestimento"]),
                new CatalogItem("Rodape", "m", ["rodape"]),
                new CatalogItem("Esquadria", "un", ["esquadria"]),
                new CatalogItem("Alvenaria", "m2", ["alvenaria"])
            ]);
    }

    public static IReadOnlyList<DocumentAnalysisItemDto> Merge(params IReadOnlyList<DocumentAnalysisItemDto>[] groups)
    {
        var items = groups.SelectMany(group => group).ToList();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var result = new List<DocumentAnalysisItemDto>();

        foreach (var item in items)
        {
            var key = $"{Normalize(item.Name)}::{Normalize(item.Unit ?? string.Empty)}";
            if (!seen.Add(key))
            {
                continue;
            }

            result.Add(item);
        }

        return result;
    }

    private static IReadOnlyList<DocumentAnalysisItemDto> BuildSuggestions(
        string text,
        string source,
        IReadOnlyList<CatalogItem> catalog)
    {
        var normalized = text.Trim().ToLowerInvariant();

        return catalog
            .Where(item => item.Keywords.Any(normalized.Contains))
            .Select(item => new DocumentAnalysisItemDto(
                item.Name,
                null,
                item.Unit,
                source,
                $"Sugestao canonica baseada em palavras-chave: {string.Join(", ", item.Keywords)}"))
            .ToList();
    }

    private static string Normalize(string value) =>
        value.Trim().ToLowerInvariant();

    private record CatalogItem(string Name, string Unit, IReadOnlyList<string> Keywords);
}
