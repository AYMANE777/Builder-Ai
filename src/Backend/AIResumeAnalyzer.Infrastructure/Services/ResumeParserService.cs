using AIResumeAnalyzer.Application.Common.Interfaces.Services;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig;
using System.Text;

namespace AIResumeAnalyzer.Infrastructure.Services;

public class ResumeParserService : IResumeParserService
{
    public async Task<string> ParseAsync(Stream stream, string fileName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(fileName)) return string.Empty;

        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        return extension switch
        {
            ".pdf" => await ParsePdfAsync(stream),
            ".docx" => await ParseDocxAsync(stream),
            ".txt" => await ParseTxtAsync(stream),
            _ => throw new NotSupportedException($"File type {extension} is not supported")
        };
    }

    private Task<string> ParsePdfAsync(Stream stream)
    {
        try
        {
            using var document = PdfDocument.Open(stream);
            var sb = new StringBuilder();
            foreach (var page in document.GetPages())
            {
                sb.AppendLine(page.Text);
            }
            var text = sb.ToString();
            Console.WriteLine($"[ResumeParserService] PDF Extracted Text Length: {text.Length}");
            return Task.FromResult(text);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ResumeParserService] PDF Error: {ex.Message}");
            return Task.FromResult(string.Empty);
        }
    }

    private Task<string> ParseDocxAsync(Stream stream)
    {
        try
        {
            using var wordDocument = WordprocessingDocument.Open(stream, false);
            var body = wordDocument.MainDocumentPart?.Document.Body;
            if (body == null) return Task.FromResult(string.Empty);

            var paragraphs = body.Elements<Paragraph>();
            var sb = new StringBuilder();
            foreach (var p in paragraphs)
            {
                sb.AppendLine(p.InnerText);
            }

            var text = sb.ToString();
            Console.WriteLine($"[ResumeParserService] DOCX Extracted Text Length: {text.Length}");
            return Task.FromResult(text);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ResumeParserService] DOCX Error: {ex.Message}");
            return Task.FromResult(string.Empty);
        }
    }

    private async Task<string> ParseTxtAsync(Stream stream)
    {
        using var reader = new StreamReader(stream, Encoding.UTF8);
        return await reader.ReadToEndAsync();
    }
}
