using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class HydraulicDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] Keywords = ["hidraul", "agua", "esgoto", "tubula", "registro", "caixa sifonada", "ralo", "conexao"];

    public bool CanHandle(DocumentAnalysisContext context) =>
        context.Workflow == "materials"
        && DocumentAnalysisTextReader.MatchesDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}", Keywords);

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        const string discipline = "Hidraulico";
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "pipeLengthM", "Tubulacao (m)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:tubulacao|tubo|linha)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "fixtureCount", "Pontos hidraulicos", DocumentAnalysisTextReader.ExtractNumber(context.RawText, "(?:pontos|registros|ralos|caixas sifonadas)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "estimatedMaterialCost", "Estimativa de materiais (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total materiais|estimativa|valor materiais|custo estimado)"));
        var extractedLines =
            DocumentAnalysisTextReader.ExtractRelevantLines(context.RawText, ["tubo", "joelho", "registro", "ralo", "caixa sifonada", "conexao", "agua", "esgoto"])
            ?? DocumentAnalysisTextReader.ExtractItems(context.RawText, 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisSuggestionCatalog.Merge(
            DocumentAnalysisItemFactory.FromLines(extractedLines, "hydraulic"),
            DocumentAnalysisSuggestionCatalog.BuildHydraulicSuggestions(context.RawText));

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Separar agua fria, esgoto e drenagem antes de consolidar materiais.");
        recommendations.Add("Conferir diametros, conexoes e quantidade de pontos hidraulicos.");

        return new DocumentAnalysisResult(
            "hydraulic-parser",
            context.ExtractionMode == "text_extracted" ? "alta" : "media",
            $"Leitura hidraulica para '{context.FileName}'. Revisar tubulacoes, conexoes e pontos de utilizacao.",
            discipline,
            fields,
            items,
            recommendations);
    }
}
