using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class PaintingDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] Keywords = ["pintura", "tinta", "massa corrida", "selador", "primer", "verniz"];

    public bool CanHandle(DocumentAnalysisContext context) =>
        context.Workflow == "materials"
        && DocumentAnalysisTextReader.MatchesDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}", Keywords);

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        const string discipline = "Pintura";
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "paintAreaM2", "Area de pintura (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:pintura|tinta|parede|massa corrida)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "estimatedMaterialCost", "Estimativa de materiais (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total materiais|estimativa|valor materiais|custo estimado)"));
        var extractedLines =
            DocumentAnalysisTextReader.ExtractRelevantLines(context.RawText, ["tinta", "massa corrida", "selador", "primer", "verniz", "lixa"])
            ?? DocumentAnalysisTextReader.ExtractItems(context.RawText, 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisSuggestionCatalog.Merge(
            DocumentAnalysisItemFactory.FromLines(extractedLines, "painting"),
            DocumentAnalysisSuggestionCatalog.BuildPaintingSuggestions(context.RawText));

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Separar tinta, massa, selador e acabamento por ambiente.");
        recommendations.Add("Conferir area de pintura e numero de demaos antes da compra.");

        return new DocumentAnalysisResult(
            "painting-parser",
            context.ExtractionMode == "text_extracted" ? "alta" : "media",
            $"Leitura de pintura para '{context.FileName}'. Revisar area de pintura, preparacao e materiais de acabamento.",
            discipline,
            fields,
            items,
            recommendations);
    }
}
