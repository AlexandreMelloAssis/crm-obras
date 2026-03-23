using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class ArchitecturalDocumentAnalysisParser : IDocumentAnalysisParser
{
    private static readonly string[] Keywords = ["arquitet", "planta", "layout", "fachada", "ambiente", "esquadria"];

    public bool CanHandle(DocumentAnalysisContext context) =>
        context.Workflow == "materials"
        && DocumentAnalysisTextReader.MatchesDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}", Keywords);

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        const string discipline = "Arquitetonico";
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "areaM2", "Area total (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:area total|area|metragem)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "wallAreaM2", "Area de paredes (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:parede|paredes|alvenaria)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "floorAreaM2", "Area de piso (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:piso|revestimento)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "ceilingAreaM2", "Area de teto (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:teto|forro|laje)"));
        var extractedLines =
            DocumentAnalysisTextReader.ExtractRelevantLines(context.RawText, ["porta", "janela", "piso", "revestimento", "rodape", "alvenaria", "esquadria"])
            ?? DocumentAnalysisTextReader.ExtractItems(context.RawText, 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisSuggestionCatalog.Merge(
            DocumentAnalysisItemFactory.FromLines(extractedLines, "architectural"),
            DocumentAnalysisSuggestionCatalog.BuildArchitecturalSuggestions(context.RawText));

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Separar acabamentos, esquadrias e revestimentos antes da compra.");
        recommendations.Add("Validar portas, janelas e metragem de piso com o projeto executivo.");

        return new DocumentAnalysisResult(
            "architectural-parser",
            context.ExtractionMode == "text_extracted" ? "alta" : "media",
            $"Leitura arquitetonica para '{context.FileName}'. Revisar acabamentos, esquadrias e metragem dos ambientes.",
            discipline,
            fields,
            items,
            recommendations);
    }
}
