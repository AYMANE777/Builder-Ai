namespace AIResumeAnalyzer.Application.Common.Interfaces.Services;

public interface IResumeParserService
{
    Task<string> ParseAsync(Stream stream, string fileName, CancellationToken cancellationToken = default);
}
