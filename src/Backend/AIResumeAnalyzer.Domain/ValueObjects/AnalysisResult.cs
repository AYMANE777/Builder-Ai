using AIResumeAnalyzer.Domain.Enums;

namespace AIResumeAnalyzer.Domain.ValueObjects;

public class AnalysisResult
{
    public Guid ResumeId { get; }
    public Guid JobId { get; }
    public double CompatibilityScore { get; }
    public double SkillMatchPercentage { get; }
    public CandidateLevel PredictedLevel { get; }
    public IReadOnlyCollection<string> MatchedSkills { get; }
    public IReadOnlyCollection<string> MissingSkills { get; }

    public AnalysisResult(
        Guid resumeId,
        Guid jobId,
        double compatibilityScore,
        double skillMatchPercentage,
        CandidateLevel predictedLevel,
        IEnumerable<string> matchedSkills,
        IEnumerable<string> missingSkills)
    {
        ResumeId = resumeId;
        JobId = jobId;
        CompatibilityScore = compatibilityScore;
        SkillMatchPercentage = skillMatchPercentage;
        PredictedLevel = predictedLevel;
        MatchedSkills = matchedSkills.ToList().AsReadOnly();
        MissingSkills = missingSkills.ToList().AsReadOnly();
    }
}




