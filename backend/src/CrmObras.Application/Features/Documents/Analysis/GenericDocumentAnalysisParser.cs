using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

public class GenericDocumentAnalysisParser : IDocumentAnalysisParser
{
    public bool CanHandle(DocumentAnalysisContext context) => true;

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        var discipline = DocumentAnalysisTextReader.DetectDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}");
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        var extractedLines = DocumentAnalysisTextReader.ExtractItems(context.RawText, maxLines: 5);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisItemFactory.FromLines(extractedLines, "generic");

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Usar como documento de referencia e registrar observacoes de execucao.");

        var summary =
            $"Leitura generica para documento de apoio. Documento '{context.FileName}' classificado como '{context.CategoryName}'. " +
            $"{(fields.Count == 0 ? "Nenhum campo objetivo foi identificado automaticamente." : $"{fields.Count} campos basicos sugeridos foram encontrados.")}";

        return new DocumentAnalysisResult(
            "generic-parser",
            context.ExtractionMode == "ocr_http" ? "media" : "baixa",
            summary,
            discipline,
            fields,
            items,
            recommendations);
    }
}
