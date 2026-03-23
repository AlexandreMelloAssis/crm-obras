using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class MarbleDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] Keywords = ["marmor", "granito", "pedra", "soleira", "peitoril", "bancada"];

    public bool CanHandle(DocumentAnalysisContext context) =>
        context.Workflow == "materials"
        && DocumentAnalysisTextReader.MatchesDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}", Keywords);

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        const string discipline = "Marmore";
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "areaM2", "Area total (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:area|metragem|bancada|soleira|peitoril)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "estimatedMaterialCost", "Estimativa de materiais (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total materiais|estimativa|valor materiais|custo estimado)"));
        var extractedLines =
            DocumentAnalysisTextReader.ExtractRelevantLines(context.RawText, ["granito", "marmore", "soleira", "peitoril", "bancada", "pedra"])
            ?? DocumentAnalysisTextReader.ExtractItems(context.RawText, 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisSuggestionCatalog.Merge(
            DocumentAnalysisItemFactory.FromLines(extractedLines, "marble"),
            DocumentAnalysisSuggestionCatalog.BuildMarbleSuggestions(context.RawText));

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Separar bancadas, soleiras e peitoris por ambiente.");
        recommendations.Add("Conferir espessura, acabamento e metragem antes da compra.");

        return new DocumentAnalysisResult(
            "marble-parser",
            context.ExtractionMode == "text_extracted" ? "alta" : "media",
            $"Leitura de marmore/pedra para '{context.FileName}'. Revisar pecas especiais, metragem e acabamento.",
            discipline,
            fields,
            items,
            recommendations);
    }
}
