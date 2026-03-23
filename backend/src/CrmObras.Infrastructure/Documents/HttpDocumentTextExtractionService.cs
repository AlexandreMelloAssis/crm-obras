using System.Net.Http.Headers;
using System.Text.Json;
using CrmObras.Application.Abstractions.Documents;
using Microsoft.Extensions.Options;

namespace CrmObras.Infrastructure.Documents;

public class HttpDocumentTextExtractionService(
    HttpClient httpClient,
    IOptions<DocumentIntelligenceOptions> options) : IDocumentTextExtractionService
{
    private static readonly string[] OcrEligibleExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"];
    private readonly DocumentIntelligenceOptions _options = options.Value;

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

        if (!ShouldUseOcr(contentType, fileName))
        {
            return new DocumentTextExtractionResult(
                "manual_review",
                string.Empty,
                "Arquivo fora do escopo configurado para OCR HTTP. A leitura segue em revisao manual.");
        }

        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.Endpoint))
        {
            return new DocumentTextExtractionResult(
                "ocr_not_configured",
                string.Empty,
                "OCR HTTP ainda nao configurado neste ambiente. Configure DocumentIntelligence:Endpoint para PDF/imagem.");
        }

        using var form = new MultipartFormDataContent();
        await using var stream = File.OpenRead(storagePath);
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType);
        form.Add(fileContent, "file", fileName);
        form.Add(new StringContent(fileName), "fileName");
        form.Add(new StringContent(contentType ?? string.Empty), "contentType");

        using var request = new HttpRequestMessage(HttpMethod.Post, _options.Endpoint)
        {
            Content = form
        };

        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            request.Headers.Add("X-Api-Key", _options.ApiKey);
        }

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return new DocumentTextExtractionResult(
                    "ocr_http_failed",
                    string.Empty,
                    $"OCR HTTP retornou {(int)response.StatusCode}. A leitura continua disponivel para revisao manual.");
            }

            var payload = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(payload))
            {
                return new DocumentTextExtractionResult(
                    "ocr_http_empty",
                    string.Empty,
                    "OCR HTTP respondeu sem conteudo textual.");
            }

            using var json = JsonDocument.Parse(payload);
            var rawText = ReadText(json.RootElement);
            var preview = BuildPreview(rawText);

            return new DocumentTextExtractionResult(
                "ocr_http",
                rawText,
                preview);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch
        {
            return new DocumentTextExtractionResult(
                "ocr_http_unavailable",
                string.Empty,
                "Nao foi possivel comunicar com o provedor OCR HTTP. A leitura fica disponivel para revisao manual.");
        }
    }

    private static bool ShouldUseOcr(string contentType, string fileName)
    {
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (contentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return OcrEligibleExtensions.Contains(Path.GetExtension(fileName), StringComparer.OrdinalIgnoreCase);
    }

    private static string ReadText(JsonElement root)
    {
        foreach (var property in new[] { "text", "content", "rawText", "fullText", "markdown" })
        {
            if (root.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String)
            {
                return value.GetString() ?? string.Empty;
            }
        }

        if (root.TryGetProperty("result", out var result) && result.ValueKind == JsonValueKind.Object)
        {
            return ReadText(result);
        }

        return string.Empty;
    }

    private static string BuildPreview(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            return "OCR executado, mas nenhum texto estruturado foi retornado.";
        }

        var normalized = rawText.Replace("\r", " ").Replace("\n", " ").Trim();
        return normalized.Length <= 220 ? normalized : $"{normalized[..220]}...";
    }
}
