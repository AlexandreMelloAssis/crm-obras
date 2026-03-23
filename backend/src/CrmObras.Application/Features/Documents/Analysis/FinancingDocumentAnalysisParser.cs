using System.Text.RegularExpressions;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class FinancingDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] FinancingKeywords =
    [
        "financi",
        "contrato",
        "saldo devedor",
        "valor financiado",
        "prestacao",
        "caixa"
    ];

    private static readonly string[] ScheduleKeywords =
    [
        "cronograma",
        "etapa",
        "fundacao",
        "alvenaria",
        "cobertura",
        "acabamento",
        "pintura",
        "revestimento",
        "esquadria",
        "instalacao"
    ];

    public bool CanHandle(DocumentAnalysisContext context)
    {
        var combined = $"{context.CategoryName} {context.FileName} {context.RawText}".ToLowerInvariant();

        return FinancingKeywords.Any(combined.Contains)
            || ScheduleKeywords.Any(combined.Contains);
    }

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        var normalizedRawText = NormalizeRawText(context.RawText);
        var combined = $"{context.CategoryName} {context.FileName} {normalizedRawText}".ToLowerInvariant();
        var scheduleLike = ScheduleKeywords.Any(combined.Contains);
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "contractNumber", "Numero do contrato", ExtractContractNumber(normalizedRawText, context.FileName));
        DocumentAnalysisHelpers.AddIfFound(fields, "financedAmount", "Valor financiado (R$)", ExtractFinancedAmount(normalizedRawText));
        DocumentAnalysisHelpers.AddIfFound(fields, "contractSigningDate", "Data de assinatura", ExtractContractSigningDate(normalizedRawText));

        var stageItems = scheduleLike
            ? ExtractStageItems(normalizedRawText, context.FileName)
            : [];

        if (stageItems.Count > 0)
        {
            DocumentAnalysisHelpers.AddIfFound(
                fields,
                "workStages",
                "Etapas da obra",
                string.Join("; ", stageItems.Select(item => item.Name)));
        }

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, null).ToList();
        recommendations.Add("Conferir numero do contrato, valor financiado e data de assinatura antes de salvar.");

        if (scheduleLike)
        {
            recommendations.Add("Validar a ordem e os nomes das etapas antes de vincular ao contrato.");
        }

        var confidence = context.ExtractionMode switch
        {
            "ocr_http" => "media",
            "text_extracted" => "alta",
            _ => "baixa"
        };

        var summary =
            scheduleLike
                ? $"Leitura de cronograma/financiamento para '{context.FileName}'. {(stageItems.Count == 0 ? "Nenhuma etapa foi identificada automaticamente." : $"{stageItems.Count} etapa(s) da obra foram sugeridas.")}"
                : $"Leitura de contrato de financiamento para '{context.FileName}'. {(fields.Count == 0 ? "Nenhum dado objetivo foi identificado automaticamente." : $"{fields.Count} campo(s) do contrato foram sugeridos.")}";

        return new DocumentAnalysisResult(
            "financing-parser",
            confidence,
            summary,
            null,
            fields,
            stageItems,
            recommendations);
    }

    private static string? ExtractContractNumber(string rawText, string fileName)
    {
        var fromText = DocumentAnalysisTextReader.ExtractTextValue(rawText, "(?:contrato|numero do contrato|n[ºo.] do contrato)");
        if (!string.IsNullOrWhiteSpace(fromText))
        {
            return fromText;
        }

        var fileMatch = Regex.Match(fileName, @"(?<contract>\d{6,}(?:-\d+)?)");
        return fileMatch.Success ? fileMatch.Groups["contract"].Value : null;
    }

    private static string? ExtractFinancedAmount(string rawText)
    {
        return DocumentAnalysisTextReader.ExtractCurrency(rawText, "(?:valor financiado|financiado|valor do contrato|saldo devedor|total do financiamento)");
    }

    private static string? ExtractContractSigningDate(string rawText)
    {
        return DocumentAnalysisTextReader.ExtractDate(rawText, "(?:assinatura|data de assinatura|contrato assinado|celebrado em|data do contrato|emissao|data)");
    }

    private static IReadOnlyList<DocumentAnalysisItemDto> ExtractStageItems(string rawText, string fileName)
    {
        var sourceText = string.IsNullOrWhiteSpace(rawText) ? fileName : rawText;
        var lines = sourceText
            .Split(['\r', '\n', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(NormalizeStageName)
            .Where(stage => !string.IsNullOrWhiteSpace(stage))
            .Where(IsLikelyStage)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(12)
            .ToList();

        if (lines.Count == 0 && fileName.ToLowerInvariant().Contains("cronograma"))
        {
            lines =
            [
                "Fundacao",
                "Estrutura",
                "Alvenaria",
                "Instalacoes",
                "Acabamentos"
            ];
        }

        return lines
            .Select(stage => new DocumentAnalysisItemDto(stage, null, null, "financing-schedule", stage))
            .ToList();
    }

    private static string NormalizeStageName(string line)
    {
        var cleaned = Regex.Replace(line, @"^\d+[\.\)-]?\s*", string.Empty);
        cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim(' ', '-', ':', '.', '/', '\\');
        return cleaned;
    }

    private static bool IsLikelyStage(string line)
    {
        if (line.Length < 4 || line.Length > 80)
        {
            return false;
        }

        var normalized = line.ToLowerInvariant();
        return ScheduleKeywords.Any(normalized.Contains)
            && !normalized.Contains("cronograma da obra")
            && !normalized.Contains(".pdf");
    }

    private static string NormalizeRawText(string value) =>
        value
            .Replace('—', '-')
            .Replace('–', '-')
            .Replace('‑', '-');
}
