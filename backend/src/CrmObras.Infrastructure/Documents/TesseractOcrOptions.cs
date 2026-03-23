namespace CrmObras.Infrastructure.Documents;

public class TesseractOcrOptions
{
    public const string SectionName = "TesseractOcr";

    public bool Enabled { get; set; } = true;
    public string ExecutablePath { get; set; } = "tesseract";
    public string Languages { get; set; } = "por+eng";
    public int PageSegmentationMode { get; set; } = 6;
    public int EngineMode { get; set; } = 1;
    public string TessDataPath { get; set; } = string.Empty;
}
