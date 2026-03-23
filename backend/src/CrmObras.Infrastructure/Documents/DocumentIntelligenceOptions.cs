namespace CrmObras.Infrastructure.Documents;

public class DocumentIntelligenceOptions
{
    public const string SectionName = "DocumentIntelligence";

    public bool Enabled { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 60;
}
