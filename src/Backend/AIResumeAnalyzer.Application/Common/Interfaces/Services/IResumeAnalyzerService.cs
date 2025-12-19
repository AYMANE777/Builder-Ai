using AIResumeAnalyzer.Domain.Entities;
using AIResumeAnalyzer.Domain.ValueObjects;

namespace AIResumeAnalyzer.Application.Common.Interfaces.Services;

public interface IResumeAnalyzerService
{
    Task<AnalysisResult> AnalyzeAsync(
        Resume resume,
        JobDescription jobDescription,
        CancellationToken cancellationToken = default);
}




