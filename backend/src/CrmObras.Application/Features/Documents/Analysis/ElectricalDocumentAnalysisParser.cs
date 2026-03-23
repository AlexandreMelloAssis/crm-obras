using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class ElectricalDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] Keywords = ["eletric", "tomada", "quadro", "ilumin", "disjuntor", "circuito", "eletroduto", "cabo"];

    public bool CanHandle(DocumentAnalysisContext context) =>
        context.Workflow == "materials"
        && DocumentAnalysisTextReader.MatchesDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}", Keywords);

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        const string discipline = "Eletrico";
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "pointCount", "Pontos eletricos", DocumentAnalysisTextReader.ExtractNumber(context.RawText, "(?:pontos|tomadas|luminarias|interruptores)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "circuitCount", "Circuitos", DocumentAnalysisTextReader.ExtractNumber(context.RawText, "(?:circuitos|disjuntores)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "estimatedMaterialCost", "Estimativa de materiais (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total materiais|estimativa|valor materiais|custo estimado)"));
        var extractedLines =
            DocumentAnalysisTextReader.ExtractRelevantLines(context.RawText, ["tomada", "interruptor", "luminaria", "quadro", "cabo", "eletroduto", "disjuntor"])
            ?? DocumentAnalysisTextReader.ExtractItems(context.RawText, 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisSuggestionCatalog.Merge(
            DocumentAnalysisItemFactory.FromLines(extractedLines, "electrical"),
            DocumentAnalysisSuggestionCatalog.BuildElectricalSuggestions(context.RawText));

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Separar materiais por circuito, quadro e pontos de utilizacao.");
        recommendations.Add("Validar quantidade de tomadas, interruptores e luminarias antes da compra.");

        return new DocumentAnalysisResult(
            "electrical-parser",
            context.ExtractionMode == "text_extracted" ? "alta" : "media",
            $"Leitura eletrica para '{context.FileName}'. Revisar pontos, circuitos e materiais de instalacao.",
            discipline,
            fields,
            items,
            recommendations);
    }
}
