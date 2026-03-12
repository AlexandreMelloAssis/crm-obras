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
    [HttpPost("upload")]
    [RequestSizeLimit(20_000_000)]
    public async Task<Guid> Upload([FromForm] Guid workProjectId, [FromForm] Guid categoryId, [FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        return await uploadDocumentCommandHandler.HandleAsync(
            new UploadDocumentCommand(workProjectId, categoryId, file.FileName, file.ContentType, stream),
            cancellationToken);
    }
}
