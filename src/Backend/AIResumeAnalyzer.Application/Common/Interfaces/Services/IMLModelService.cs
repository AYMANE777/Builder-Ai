namespace AIResumeAnalyzer.Application.Common.Interfaces.Services;

public interface IMLModelService
{
    Task<(double similarity, string predictedLevel)> ScoreAndPredictAsync(
        string resumeText,
        string jobText,
        CancellationToken cancellationToken = default);
}




