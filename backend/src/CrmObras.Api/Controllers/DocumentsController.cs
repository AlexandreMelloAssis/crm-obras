using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.Features.Documents.Commands.UploadDocument;
using CrmObras.Application.Features.Documents.Queries.AnalyzeDocument;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Documents.Queries.ListDocumentCategories;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/documents")]
public class DocumentsController(
    UploadDocumentCommandHandler uploadDocumentCommandHandler,
    ListDocumentCategoriesQueryHandler listDocumentCategoriesQueryHandler,
    AnalyzeDocumentQueryHandler analyzeDocumentQueryHandler) : ControllerBase
{
    public sealed record UploadDocumentRequest(Guid WorkId, Guid CategoryId, IFormFile File);

    [HttpGet("categories")]
    public Task<IReadOnlyList<DocumentCategoryDto>> ListCategories(CancellationToken cancellationToken) =>
        listDocumentCategoriesQueryHandler.HandleAsync(new ListDocumentCategoriesQuery(), cancellationToken);

    [HttpGet("{id:guid}/analysis")]
    public Task<DocumentAnalysisDto> Analyze(Guid id, CancellationToken cancellationToken) =>
        analyzeDocumentQueryHandler.HandleAsync(new AnalyzeDocumentQuery(id), cancellationToken);

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(20_000_000)]
    public async Task<Guid> Upload([FromForm] UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        await using var stream = request.File.OpenReadStream();
        return await uploadDocumentCommandHandler.HandleAsync(
            new UploadDocumentCommand(
                request.WorkId,
                request.CategoryId,
                request.File.FileName,
                request.File.ContentType,
                stream),
            cancellationToken);
    }
}

