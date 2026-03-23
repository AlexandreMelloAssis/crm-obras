using System.Globalization;
using System.Text.RegularExpressions;

namespace CrmObras.Application.Features.Documents.Analysis;

internal static class DocumentAnalysisTextReader
{
    public static string? DetectDiscipline(string text)
    {
        var normalized = text.Trim().ToLowerInvariant();

        if (ContainsAny(normalized, "arquitet", "planta", "layout", "fachada")) return "Arquitetonico";
        if (ContainsAny(normalized, "eletric", "tomada", "ilumin", "quadro")) return "Eletrico";
        if (ContainsAny(normalized, "hidraul", "agua", "esgoto", "tubula")) return "Hidraulico";
        if (ContainsAny(normalized, "gesso", "forro", "sanca")) return "Gesso";
        if (ContainsAny(normalized, "marmor", "granito", "pedra")) return "Marmore";
        if (ContainsAny(normalized, "pintura", "tinta", "massa corrida")) return "Pintura";

        return null;
    }

    public static bool ContainsAny(string value, params string[] candidates) =>
        candidates.Any(value.Contains);

    public static bool MatchesDiscipline(string text, params string[] keywords) =>
        ContainsAny(text.Trim().ToLowerInvariant(), keywords);

    public static string? ExtractMeasurement(string text, string labelPattern)
    {
        var regex = new Regex($@"{labelPattern}[^0-9]{{0,20}}(?<value>\d+(?:[\.,]\d+)?)\s?(?:m2|m²|mÂ²)", RegexOptions.IgnoreCase);
        var match = regex.Match(text);
        return match.Success ? match.Groups["value"].Value.Replace(',', '.') : null;
    }

    public static string? ExtractCurrency(string text, string labelPattern)
    {
        var regex = new Regex($@"{labelPattern}[^0-9]{{0,25}}(?:R\$\s*)?(?<value>\d{{1,3}}(?:\.\d{{3}})*(?:,\d{{2}})|\d+(?:,\d{{2}}))", RegexOptions.IgnoreCase);
        var match = regex.Match(text);
        return match.Success ? NormalizeDecimal(match.Groups["value"].Value) : null;
    }

    public static string? ExtractNumber(string text, string labelPattern)
    {
        var regex = new Regex($@"{labelPattern}[^0-9]{{0,20}}(?<value>\d{{1,4}})", RegexOptions.IgnoreCase);
        var match = regex.Match(text);
        return match.Success ? match.Groups["value"].Value : null;
    }

    public static string? ExtractDate(string text, string labelPattern)
    {
        var regex = new Regex($@"{labelPattern}[^0-9]{{0,20}}(?<value>\d{{2}}/\d{{2}}/\d{{4}})", RegexOptions.IgnoreCase);
        var match = regex.Match(text);
        return match.Success ? match.Groups["value"].Value : null;
    }

    public static string? ExtractTextValue(string text, string labelPattern)
    {
        var regex = new Regex($@"{labelPattern}[^A-Za-z0-9]{{0,10}}(?<value>[A-Za-z0-9\-/\. ]{{4,80}})", RegexOptions.IgnoreCase);
        var match = regex.Match(text);
        return match.Success ? match.Groups["value"].Value.Trim(' ', '-', ':') : null;
    }

    public static string? ExtractPaymentTerms(string text)
    {
        var regex = new Regex(@"(pagamento|condicao de pagamento)[^A-Za-z0-9]{0,10}(?<value>[A-Za-z0-9 ,./-]{5,80})", RegexOptions.IgnoreCase);
        var match = regex.Match(text);
        return match.Success ? match.Groups["value"].Value.Trim() : null;
    }

    public static string? ExtractSupplier(string text, string fileName)
    {
        var supplierRegex = new Regex(@"(fornecedor|emitente|razao social)[^A-Za-z0-9]{0,10}(?<value>[A-Za-z0-9 .&/-]{4,80})", RegexOptions.IgnoreCase);
        var match = supplierRegex.Match(text);
        if (match.Success)
        {
            return match.Groups["value"].Value.Trim();
        }

        var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        if (nameWithoutExtension.Contains('-'))
        {
            return nameWithoutExtension.Split('-', 2)[0].Trim();
        }

        return null;
    }

    public static string? ExtractItems(string text, int maxLines = 5)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return null;
        }

        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(line => line.Length > 5)
            .Take(maxLines)
            .ToArray();

        return lines.Length == 0 ? null : string.Join("; ", lines);
    }

    public static string? ExtractRelevantLines(string text, string[] keywords, int maxLines = 8)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return null;
        }

        var normalizedKeywords = keywords.Select(keyword => keyword.ToLowerInvariant()).ToArray();
        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(line =>
            {
                var normalized = line.ToLowerInvariant();
                return normalizedKeywords.Any(normalized.Contains);
            })
            .Take(maxLines)
            .ToArray();

        return lines.Length == 0 ? null : string.Join("; ", lines);
    }

    public static string NormalizeDecimal(string value)
    {
        var normalized = value.Replace(".", "").Replace(",", ".");
        return decimal.TryParse(normalized, NumberStyles.Any, CultureInfo.InvariantCulture, out var decimalValue)
            ? decimalValue.ToString("0.##", CultureInfo.InvariantCulture)
            : normalized;
    }
}
