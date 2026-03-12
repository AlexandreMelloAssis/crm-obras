using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmObras.Application.Features.Documents.Commands.UploadDocument;

namespace CrmObras.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Authorize]
[Route("api/v{version:apiVersion}/documents")]
public class DocumentsController(UploadDocumentCommandHandler uploadDocumentCommandHandler) : ControllerBase
{
    public sealed record UploadDocumentRequest(Guid WorkProjectId, Guid CategoryId, IFormFile File);

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(20_000_000)]
    public async Task<Guid> Upload([FromForm] UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        await using var stream = request.File.OpenReadStream();
        return await uploadDocumentCommandHandler.HandleAsync(
            new UploadDocumentCommand(
                request.WorkProjectId,
                request.CategoryId,
                request.File.FileName,
                request.File.ContentType,
                stream),
            cancellationToken);
    }
}
