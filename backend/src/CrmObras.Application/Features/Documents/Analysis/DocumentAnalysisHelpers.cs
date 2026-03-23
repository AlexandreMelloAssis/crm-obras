using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

internal static class DocumentAnalysisHelpers
{
    public static void AddIfFound(List<DocumentAnalysisFieldDto> fields, string key, string label, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            fields.Add(new DocumentAnalysisFieldDto(key, label, value.Trim()));
        }
    }

    public static IReadOnlyList<string> BuildBaseRecommendations(DocumentAnalysisContext context, string? discipline)
    {
        var items = new List<string>();

        if (context.ExtractionMode is not ("text_extracted" or "ocr_http"))
        {
            items.Add("Revise visualmente o arquivo e confirme os dados antes de gerar materiais, cotacoes ou custos.");
        }

        if (!string.IsNullOrWhiteSpace(discipline))
        {
            items.Add($"Encaminhe a leitura para o fluxo de {discipline.ToLowerInvariant()} caso o projeto confirme essa disciplina.");
        }

        return items;
    }
}
