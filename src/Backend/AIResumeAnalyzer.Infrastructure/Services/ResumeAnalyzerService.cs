using AIResumeAnalyzer.Application.Common.Interfaces.Services;
using AIResumeAnalyzer.Domain.Entities;
using AIResumeAnalyzer.Domain.Enums;
using AIResumeAnalyzer.Domain.ValueObjects;
using AIResumeAnalyzer.Infrastructure.Nlp;

namespace AIResumeAnalyzer.Infrastructure.Services;

public class ResumeAnalyzerService : IResumeAnalyzerService
{
    private readonly ISkillDictionary _skillDictionary;
    private readonly INlpPreprocessor _nlpPreprocessor;
    private readonly IMLModelService _mlModelService;

    public ResumeAnalyzerService(
        ISkillDictionary skillDictionary,
        INlpPreprocessor nlpPreprocessor,
        IMLModelService mlModelService)
    {
        _skillDictionary = skillDictionary;
        _nlpPreprocessor = nlpPreprocessor;
        _mlModelService = mlModelService;
    }

    public async Task<AnalysisResult> AnalyzeAsync(
        Resume resume,
        JobDescription job,
        CancellationToken cancellationToken = default)
    {
        var resumeTokens = _nlpPreprocessor.Preprocess(resume.RawText, resume.Language);
        var jobTokens = _nlpPreprocessor.Preprocess(job.DescriptionText, job.Language);

        var resumeSkills = _skillDictionary.ExtractSkills(resumeTokens);
        var jobSkills = _skillDictionary.ExtractSkills(jobTokens);

        foreach (var s in resumeSkills)
            resume.AddSkill(new Skill(s, "auto"));

        foreach (var s in jobSkills)
            job.AddRequiredSkill(new Skill(s, "required"));

        var matched = jobSkills.Intersect(resumeSkills, StringComparer.OrdinalIgnoreCase).ToList();
        var missing = jobSkills.Except(resumeSkills, StringComparer.OrdinalIgnoreCase).ToList();

        double skillMatch = jobSkills.Any()
            ? matched.Count / (double)jobSkills.Count * 100.0
            : 0.0;

        var (similarityScore, predictedLevel) =
            await _mlModelService.ScoreAndPredictAsync(resume.RawText, job.DescriptionText, cancellationToken);

        double compatibilityScore = Math.Round(
            (similarityScore * 100.0 * 0.6) + (skillMatch * 0.4), 2);

        var level = predictedLevel switch
        {
            "Junior" => CandidateLevel.Junior,
            "Mid" => CandidateLevel.Mid,
            "Senior" => CandidateLevel.Senior,
            _ => CandidateLevel.Reject
        };

        return new AnalysisResult(
            resume.Id,
            job.Id,
            compatibilityScore,
            Math.Round(skillMatch, 2),
            level,
            matched,
            missing);
    }
}

