namespace CrmObras.Application.Features.Documents.Analysis;

public interface IDocumentAnalysisParser
{
    bool CanHandle(DocumentAnalysisContext context);
    DocumentAnalysisResult Parse(DocumentAnalysisContext context);
}
