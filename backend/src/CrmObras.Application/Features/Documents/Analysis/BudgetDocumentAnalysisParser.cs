using CrmObras.Application.DTOs;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Documents.Analysis;

public class BudgetDocumentAnalysisParser : IDocumentAnalysisParser
{
    public bool CanHandle(DocumentAnalysisContext context) =>
        context.CategoryType is DocumentCategoryType.Budget or DocumentCategoryType.NegotiationPrint
        || context.Workflow == "quotation";

    public DocumentAnalysisResult Parse(DocumentAnalysisContext context)
    {
        var discipline = DocumentAnalysisTextReader.DetectDiscipline($"{context.CategoryName} {context.FileName} {context.RawText}");
        var fields = new List<DocumentAnalysisFieldDto>();

        DocumentAnalysisHelpers.AddIfFound(fields, "discipline", "Disciplina", discipline);
        DocumentAnalysisHelpers.AddIfFound(fields, "supplierName", "Fornecedor", DocumentAnalysisTextReader.ExtractSupplier(context.RawText, context.FileName));
        DocumentAnalysisHelpers.AddIfFound(fields, "quoteReference", "Referencia", DocumentAnalysisTextReader.ExtractTextValue(context.RawText, "(?:proposta|orcamento|cotacao|pedido)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "freightValue", "Frete (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:frete|entrega)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "paymentTerms", "Condicao de pagamento", DocumentAnalysisTextReader.ExtractPaymentTerms(context.RawText));
        DocumentAnalysisHelpers.AddIfFound(fields, "leadTimeDays", "Prazo (dias)", DocumentAnalysisTextReader.ExtractNumber(context.RawText, "(?:prazo|entrega)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "validityDays", "Validade (dias)", DocumentAnalysisTextReader.ExtractNumber(context.RawText, "(?:validade)"));
        DocumentAnalysisHelpers.AddIfFound(fields, "totalAmount", "Valor total (R$)", DocumentAnalysisTextReader.ExtractCurrency(context.RawText, "(?:total|valor total|liquido)"));
        var extractedLines = DocumentAnalysisTextReader.ExtractItems(context.RawText, maxLines: 6);
        DocumentAnalysisHelpers.AddIfFound(fields, "extractedItems", "Itens extraidos", extractedLines);
        var items = DocumentAnalysisItemFactory.FromLines(extractedLines, "budget");

        var recommendations = DocumentAnalysisHelpers.BuildBaseRecommendations(context, discipline).ToList();
        recommendations.Add("Comparar com pelo menos 3 propostas ou registrar justificativa.");
        recommendations.Add("Consolidar frete, validade e prazo no modulo de cotacoes.");
        recommendations.Add("Registrar fornecedor e itens principais antes de enviar para analise comercial.");

        var confidence = context.ExtractionMode switch
        {
            "ocr_http" => "media",
            "text_extracted" => "alta",
            _ => "baixa"
        };

        var summary =
            $"Leitura comercial para cotacao/orcamento. Documento '{context.FileName}' classificado como '{context.CategoryName}'. " +
            $"{(fields.Count == 0 ? "Nenhum campo comercial foi identificado automaticamente." : $"{fields.Count} campos comerciais sugeridos foram encontrados.")}";

        return new DocumentAnalysisResult(
            "budget-parser",
            confidence,
            summary,
            discipline,
            fields,
            items,
            recommendations);
    }
}
