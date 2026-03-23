using System.ComponentModel;
using System.Diagnostics;
using CrmObras.Application.Abstractions.Documents;
using Microsoft.Extensions.Options;

namespace CrmObras.Infrastructure.Documents;

public class TesseractTextExtractionService(IOptions<TesseractOcrOptions> options) : IDocumentTextExtractionService
{
    private static readonly string[] SupportedExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"];
    private readonly TesseractOcrOptions _options = options.Value;

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

        if (!ShouldUseTesseract(contentType, fileName))
        {
            return new DocumentTextExtractionResult(
                "tesseract_skipped",
                string.Empty,
                "Tesseract foi ignorado para este tipo de arquivo.");
        }

        if (!_options.Enabled)
        {
            return new DocumentTextExtractionResult(
                "tesseract_disabled",
                string.Empty,
                "Tesseract OCR esta desativado neste ambiente.");
        }

        var executable = string.IsNullOrWhiteSpace(_options.ExecutablePath) ? "tesseract" : _options.ExecutablePath;

        var psi = new ProcessStartInfo
        {
            FileName = executable,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        psi.ArgumentList.Add(storagePath);
        psi.ArgumentList.Add("stdout");
        psi.ArgumentList.Add("-l");
        psi.ArgumentList.Add(string.IsNullOrWhiteSpace(_options.Languages) ? "por+eng" : _options.Languages);
        psi.ArgumentList.Add("--psm");
        psi.ArgumentList.Add((_options.PageSegmentationMode <= 0 ? 6 : _options.PageSegmentationMode).ToString());
        psi.ArgumentList.Add("--oem");
        psi.ArgumentList.Add((_options.EngineMode < 0 ? 1 : _options.EngineMode).ToString());

        if (!string.IsNullOrWhiteSpace(_options.TessDataPath))
        {
            psi.ArgumentList.Add("--tessdata-dir");
            psi.ArgumentList.Add(_options.TessDataPath);
        }

        psi.ArgumentList.Add("quiet");

        try
        {
            using var process = new Process { StartInfo = psi };
            process.Start();

            var stdOutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
            var stdErrTask = process.StandardError.ReadToEndAsync(cancellationToken);

            await process.WaitForExitAsync(cancellationToken);

            var stdout = (await stdOutTask).Trim();
            var stderr = (await stdErrTask).Trim();

            if (process.ExitCode != 0)
            {
                return new DocumentTextExtractionResult(
                    "tesseract_failed",
                    string.Empty,
                    string.IsNullOrWhiteSpace(stderr)
                        ? "Tesseract OCR falhou ao processar o arquivo."
                        : $"Tesseract OCR falhou: {stderr}");
            }

            if (string.IsNullOrWhiteSpace(stdout))
            {
                return new DocumentTextExtractionResult(
                    "tesseract_empty",
                    string.Empty,
                    "Tesseract OCR respondeu sem texto reconhecido.");
            }

            return new DocumentTextExtractionResult(
                "tesseract",
                stdout,
                BuildPreview(stdout));
        }
        catch (Win32Exception)
        {
            return new DocumentTextExtractionResult(
                "tesseract_not_installed",
                string.Empty,
                "Tesseract OCR nao foi encontrado neste ambiente. Configure o executavel em TesseractOcr:ExecutablePath.");
        }
    }

    private static bool ShouldUseTesseract(string contentType, string fileName)
    {
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return SupportedExtensions.Contains(Path.GetExtension(fileName), StringComparer.OrdinalIgnoreCase);
    }

    private static string BuildPreview(string rawText)
    {
        var normalized = rawText.Replace("\r", " ").Replace("\n", " ").Trim();
        return normalized.Length <= 220 ? normalized : $"{normalized[..220]}...";
    }
}
