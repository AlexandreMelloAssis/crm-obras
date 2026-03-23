using System.Text;
using CrmObras.Application.Abstractions.Documents;

namespace CrmObras.Infrastructure.Documents;

public class CompositeDocumentTextExtractionService(
    TesseractTextExtractionService tesseractTextExtractionService,
    WindowsImageOcrTextExtractionService windowsImageOcrTextExtractionService,
    HttpDocumentTextExtractionService httpExtractionService) : IDocumentTextExtractionService
{
    private static readonly string[] TextExtensions = [".txt", ".csv", ".json", ".xml", ".md"];
    private static readonly string[] ImageExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"];

    public async Task<DocumentTextExtractionResult> ExtractAsync(
        string storagePath,
        string contentType,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        if (!File.Exists(storagePath))
        {
            return new DocumentTextExtractionResult(
                "file_not_found",
                string.Empty,
                "Arquivo nao encontrado no armazenamento local.");
        }

        if (contentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase)
            || TextExtensions.Contains(Path.GetExtension(fileName), StringComparer.OrdinalIgnoreCase))
        {
            var rawText = await File.ReadAllTextAsync(storagePath, Encoding.UTF8, cancellationToken);
            return new DocumentTextExtractionResult(
                "text_extracted",
                rawText,
                BuildPreview(rawText));
        }

        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
            || ImageExtensions.Contains(Path.GetExtension(fileName), StringComparer.OrdinalIgnoreCase))
        {
            var tesseractResult = await tesseractTextExtractionService.ExtractAsync(
                storagePath,
                contentType,
                fileName,
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(tesseractResult.RawText))
            {
                return tesseractResult;
            }

            var windowsOcrResult = await windowsImageOcrTextExtractionService.ExtractAsync(
                storagePath,
                contentType,
                fileName,
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(windowsOcrResult.RawText))
            {
                return windowsOcrResult;
            }
        }

        return await httpExtractionService.ExtractAsync(storagePath, contentType, fileName, cancellationToken);
    }

    private static string BuildPreview(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            return string.Empty;
        }

        var preview = rawText.Replace("\r", " ").Replace("\n", " ").Trim();
        return preview.Length <= 220 ? preview : $"{preview[..220]}...";
    }
}
