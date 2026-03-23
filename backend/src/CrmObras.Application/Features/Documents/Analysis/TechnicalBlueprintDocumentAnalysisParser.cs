using CrmObras.Application.DTOs;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Documents.Analysis;

public class TechnicalBlueprintDocumentAnalysisParser : IDocumentAnalysisParser
{
    public bool CanHandle(DocumentAnalysisContext context) =>
        context.CategoryType == DocumentCategoryType.TechnicalBlueprint || context.Workflow == "materials";

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        var discipline = DocumentAnalysisTextReader.DetectDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}");
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "areaM2", "Area total (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:area total|area|metragem)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "wallAreaM2", "Area de paredes (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:parede|paredes|alvenaria)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "floorAreaM2", "Area de piso (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:piso|revestimento)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "ceilingAreaM2", "Area de teto (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:teto|forro)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "paintAreaM2", "Area de pintura (m2)", DocumentAnalysisTextReader.ExtractMeasurement(context.RawText, "(?:pintura|tinta)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "estimatedMaterialCost", "Estimativa de materiais (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total materiais|estimativa|valor materiais|custo estimado)"));
        var extractedLines = DocumentAnalysisTextReader.ExtractItems(context.RawText, maxLines: 8);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisItemFactory.FromLines(extractedLines, "technical-blueprint");

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Conferir metragem e transformar os itens extraidos em materiais planejados.");
        recommendations.Add("Validar perdas tecnicas antes de consolidar quantitativos.");
        recommendations.Add("Separar materiais por disciplina antes de enviar para compras.");

        var confidence = context.ExtractionMode switch
        {
            "ocr_http" => "media",
            "text_extracted" => "alta",
            _ => "baixa"
        };

        var summary =
            $"Leitura tecnica para projeto/planta. Documento '{context.FileName}' classificado como '{context.CategoryName}'. " +
            $"{(string.IsNullOrWhiteSpace(discipline) ? string.Empty : $"Disciplina sugerida: {discipline}. ")}" +
            $"{(fields.Count == 0 ? "Nenhuma metragem objetiva foi identificada automaticamente." : $"{fields.Count} campos tecnicos sugeridos foram encontrados.")}";

        return new DocumentAnalysisResult(
            "technical-blueprint-parser",
            confidence,
            summary,
            discipline,
            fields,
            items,
            recommendations);
    }
}
