using System.Globalization;
using System.Text.RegularExpressions;
using CrmObras.Application.DTOs;

namespace CrmObras.Application.Features.Documents.Analysis;

internal static class DocumentAnalysisItemFactory
{
    public static IReadOnlyList<DocumentAnalysisItemDto> FromLines(string? lines, string source)
    {
        if (string.IsNullOrWhiteSpace(lines))
        {
            return [];
        }

        return lines
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(line => BuildItem(line, source))
            .Where(item => !string.IsNullOrWhiteSpace(item.Name))
            .ToList();
    }

    private static DocumentAnalysisItemDto BuildItem(string line, string source)
    {
        var quantityMatch = Regex.Match(line, @"(?<qty>\d+(?:[\.,]\d+)?)\s?(?<unit>m2|m²|m3|m³|kg|un|l|ml|cx|pc|pt|barra|rolo)?", RegexOptions.IgnoreCase);
        decimal? quantity = null;
        string? unit = null;

        if (quantityMatch.Success)
        {
            var qtyText = quantityMatch.Groups["qty"].Value.Replace(",", ".");
            if (decimal.TryParse(qtyText, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
            {
                quantity = parsed;
            }

            unit = string.IsNullOrWhiteSpace(quantityMatch.Groups["unit"].Value)
                ? null
                : NormalizeUnit(quantityMatch.Groups["unit"].Value);
        }

        var name = line;
        if (quantityMatch.Success)
        {
          name = Regex.Replace(line, @"[-:]\s*\d+(?:[\.,]\d+)?\s?(m2|m²|m3|m³|kg|un|l|ml|cx|pc|pt|barra|rolo)?", "", RegexOptions.IgnoreCase).Trim();
        }

        return new DocumentAnalysisItemDto(
            name,
            quantity,
            unit,
            source,
            line.Trim());
    }

    private static string NormalizeUnit(string value) =>
        value.Trim().ToLowerInvariant() switch
        {
            "m²" => "m2",
            "m³" => "m3",
            _ => value.Trim().ToLowerInvariant()
        };
}
