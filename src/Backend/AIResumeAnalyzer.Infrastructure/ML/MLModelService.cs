using AIResumeAnalyzer.Application.Common.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.ML;
using Microsoft.ML.Data;

namespace AIResumeAnalyzer.Infrastructure.ML;

public class MLModelService : IMLModelService
{
    private readonly Lazy<PredictionEngine<ResumeJobPairInput, ResumeJobPairOutput>>? _predictionEngine;
    private readonly IConfiguration _configuration;

    public MLModelService(IConfiguration configuration)
    {
        _configuration = configuration;
        
        var modelPath = configuration["ML:ModelPath"] ?? "Models/resume-level-model.zip";
        if (File.Exists(modelPath))
        {
            _predictionEngine = new Lazy<PredictionEngine<ResumeJobPairInput, ResumeJobPairOutput>>(() =>
            {
                var mlContext = new MLContext();
                ITransformer model = mlContext.Model.Load(modelPath, out _);
                return mlContext.Model.CreatePredictionEngine<ResumeJobPairInput, ResumeJobPairOutput>(model);
            });
        }
    }

    public Task<(double similarity, string predictedLevel)> ScoreAndPredictAsync(
        string resumeText,
        string jobText,
        CancellationToken cancellationToken = default)
    {
        // If model doesn't exist, use fallback scoring
        if (_predictionEngine == null)
        {
            var similarity = CalculateCosineSimilarity(resumeText, jobText);
            var level = similarity > 0.7 ? "Senior" : similarity > 0.5 ? "Mid" : similarity > 0.3 ? "Junior" : "Reject";
            return Task.FromResult((similarity, level));
        }

        var input = new ResumeJobPairInput
        {
            ResumeText = resumeText,
            JobText = jobText
        };

        var prediction = _predictionEngine.Value.Predict(input);
        return Task.FromResult(((double)prediction.CosineSimilarity, prediction.PredictedLabel));
    }

    private static double CalculateCosineSimilarity(string text1, string text2)
    {
        var words1 = text1.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries).Distinct().ToList();
        var words2 = text2.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries).Distinct().ToList();
        
        var allWords = words1.Union(words2).ToList();
        var vector1 = allWords.Select(w => words1.Contains(w) ? 1.0 : 0.0).ToArray();
        var vector2 = allWords.Select(w => words2.Contains(w) ? 1.0 : 0.0).ToArray();

        var dotProduct = vector1.Zip(vector2, (a, b) => a * b).Sum();
        var magnitude1 = Math.Sqrt(vector1.Sum(x => x * x));
        var magnitude2 = Math.Sqrt(vector2.Sum(x => x * x));

        if (magnitude1 == 0 || magnitude2 == 0) return 0.0;
        return dotProduct / (magnitude1 * magnitude2);
    }
}

public class ResumeJobPairInput
{
    public string ResumeText { get; set; } = string.Empty;
    public string JobText { get; set; } = string.Empty;
}

public class ResumeJobPairOutput
{
    public string PredictedLabel { get; set; } = "Reject";
    public float[] Score { get; set; } = Array.Empty<float>();
    public float CosineSimilarity { get; set; }
}

