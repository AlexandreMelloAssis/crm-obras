using CrmObras.Application.DTOs;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Documents.Analysis;

public class InvoiceDocumentAnalysisParser : IDocumentAnalysisParser
{
    public bool CanHandle(DocumentAnalysisContext context) =>
        context.CategoryType == DocumentCategoryType.Invoice || context.Workflow == "cost";

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        var discipline = DocumentAnalysisTextReader.DetectDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}");
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "supplierName", "Fornecedor", DocumentAnalysisTextReader.ExtractSupplier(context.RawText, context.FileName));
        DocumentAnalysisHelpers.AddIfFound(fields, "documentNumber", "Numero do documento", DocumentAnalysisTextReader.ExtractTextValue(context.RawText, "(?:nota fiscal|nf-e|nfe|documento|numero)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "issueDate", "Data de emissao", DocumentAnalysisTextReader.ExtractDate(context.RawText, "(?:emissao|data de emissao|data)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "dueDate", "Data de vencimento", DocumentAnalysisTextReader.ExtractDate(context.RawText, "(?:vencimento)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "totalAmount", "Valor total (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:valor total|total|liquido|valor da nota)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "costCenter", "Centro de custo", DocumentAnalysisTextReader.ExtractTextValue(context.RawText, "(?:centro de custo|obra|projeto)"));
        var extractedLines = DocumentAnalysisTextReader.ExtractItems(context.RawText, maxLines: 6);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisItemFactory.FromLines(extractedLines, "invoice");

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Validar fornecedor, numero do documento e valor antes de registrar no custo.");
        recommendations.Add("Associar o lancamento ao centro de custo correto da obra.");
        recommendations.Add("Conferir se o documento ja foi contabilizado para evitar duplicidade.");

        var confidence = context.ExtractionMode switch
        {
            "ocr_http" => "media",
            "text_extracted" => "alta",
            _ => "baixa"
        };

        var summary =
            $"Leitura financeira para nota/comprovante. Documento '{context.FileName}' classificado como '{context.CategoryName}'. " +
            $"{(fields.Count == 0 ? "Nenhum dado financeiro foi identificado automaticamente." : $"{fields.Count} campos financeiros sugeridos foram encontrados.")}";

        return new DocumentAnalysisResult(
            "invoice-parser",
            confidence,
            summary,
            discipline,
            fields,
            items,
            recommendations);
    }
}
