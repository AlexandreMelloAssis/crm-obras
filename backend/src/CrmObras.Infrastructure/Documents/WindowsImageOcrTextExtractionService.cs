using System.Diagnostics;
using System.Text.Json;
using CrmObras.Application.Abstractions.Documents;
using Microsoft.Extensions.Hosting;

namespace CrmObras.Infrastructure.Documents;

public class WindowsImageOcrTextExtractionService(IHostEnvironment hostEnvironment) : IDocumentTextExtractionService
{
    private static readonly string[] SupportedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"];

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

        if (!ShouldUseWindowsOcr(contentType, fileName))
        {
            return new DocumentTextExtractionResult(
                "windows_ocr_skipped",
                string.Empty,
                "OCR nativo do Windows foi ignorado para este tipo de arquivo.");
        }

        var scriptPath = Path.Combine(hostEnvironment.ContentRootPath, "Scripts", "Invoke-WindowsImageOcr.ps1");
        if (!File.Exists(scriptPath))
        {
            return new DocumentTextExtractionResult(
                "windows_ocr_script_missing",
                string.Empty,
                "Script local de OCR do Windows nao encontrado.");
        }

        var psi = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" -ImagePath \"{storagePath}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        using var process = new Process { StartInfo = psi };
        process.Start();

        var stdOutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var stdErrTask = process.StandardError.ReadToEndAsync(cancellationToken);
        await process.WaitForExitAsync(cancellationToken);

        var stdout = await stdOutTask;
        var stderr = await stdErrTask;

        if (process.ExitCode != 0)
        {
            return new DocumentTextExtractionResult(
                "windows_ocr_failed",
                string.Empty,
                string.IsNullOrWhiteSpace(stderr)
                    ? "OCR nativo do Windows falhou ao processar a imagem."
                    : $"OCR nativo do Windows falhou: {stderr.Trim()}");
        }

        if (string.IsNullOrWhiteSpace(stdout))
        {
            return new DocumentTextExtractionResult(
                "windows_ocr_empty",
                string.Empty,
                "OCR nativo do Windows respondeu sem texto.");
        }

        using var document = JsonDocument.Parse(stdout);
        var rawText = document.RootElement.TryGetProperty("text", out var textProperty)
            ? textProperty.GetString() ?? string.Empty
            : string.Empty;
        var preview = document.RootElement.TryGetProperty("preview", out var previewProperty)
            ? previewProperty.GetString() ?? string.Empty
            : string.Empty;

        return new DocumentTextExtractionResult(
            "windows_ocr",
            rawText,
            string.IsNullOrWhiteSpace(preview) ? rawText : preview);
    }

    private static bool ShouldUseWindowsOcr(string contentType, string fileName)
    {
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return SupportedExtensions.Contains(Path.GetExtension(fileName), StringComparer.OrdinalIgnoreCase);
    }
}
