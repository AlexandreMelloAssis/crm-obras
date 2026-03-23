using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class GypsumDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] Keywords = ["gesso", "forro", "sanca", "drywall", "tabica"];

    public bool CanHandle(DocumentAnalysisContext context) =>
        context.Workflow == "materials"
        && DocumentAnalysisTextReader.MatchesDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}", Keywords);

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        const string discipline = "Gesso";
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "ceilingAreaM2", "Area de forro (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:forro|gesso|drywall|sanca)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "estimatedMaterialCost", "Estimativa de materiais (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total materiais|estimativa|valor materiais|custo estimado)"));
        var extractedLines =
            DocumentAnalysisTextReader.ExtractRelevantLines(context.RawText, ["gesso", "forro", "perfil", "drywall", "sanca", "tabica", "massa"])
            ?? DocumentAnalysisTextReader.ExtractItems(context.RawText, 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisSuggestionCatalog.Merge(
            DocumentAnalysisItemFactory.FromLines(extractedLines, "gypsum"),
            DocumentAnalysisSuggestionCatalog.BuildGypsumSuggestions(context.RawText));

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Separar chapas, perfis, tabicas e massa para fechamento.");
        recommendations.Add("Conferir area de forro e detalhes de sanca antes da compra.");

        return new DocumentAnalysisResult(
            "gypsum-parser",
            context.ExtractionMode == "text_extracted" ? "alta" : "media",
            $"Leitura de gesso/forro para '{context.FileName}'. Revisar area de forro, sancas e materiais de fechamento.",
            discipline,
            fields,
            items,
            recommendations);
    }
}
