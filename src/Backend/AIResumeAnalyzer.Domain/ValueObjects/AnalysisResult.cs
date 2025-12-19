using AIResumeAnalyzer.Domain.Enums;

namespace AIResumeAnalyzer.Domain.ValueObjects;

public class AnalysisResult
{
    public Guid ResumeId { get; }
    public Guid JobId { get; }
    public double CompatibilityScore { get; }
    public double SkillMatchPercentage { get; }
    public double AtsScore { get; }
    public CandidateLevel PredictedLevel { get; }
    public string ExtractedName { get; }
    public string ExtractedEmail { get; }
    public string ExtractedPhone { get; }
    public IReadOnlyCollection<string> ExtractedSkills { get; }
    public IReadOnlyCollection<string> MatchedSkills { get; }
    public IReadOnlyCollection<string> MissingSkills { get; }
    public IReadOnlyCollection<Suggestion> Suggestions { get; }

    public AnalysisResult(
        Guid resumeId,
        Guid jobId,
        double compatibilityScore,
        double skillMatchPercentage,
        double atsScore,
        CandidateLevel predictedLevel,
        string extractedName,
        string extractedEmail,
        string extractedPhone,
        IEnumerable<string> extractedSkills,
        IEnumerable<string> matchedSkills,
        IEnumerable<string> missingSkills,
        IEnumerable<Suggestion> suggestions)
    {
        ResumeId = resumeId;
        JobId = jobId;
        CompatibilityScore = compatibilityScore;
        SkillMatchPercentage = skillMatchPercentage;
        AtsScore = atsScore;
        PredictedLevel = predictedLevel;
        ExtractedName = extractedName;
        ExtractedEmail = extractedEmail;
        ExtractedPhone = extractedPhone;
        ExtractedSkills = extractedSkills.ToList().AsReadOnly();
        MatchedSkills = matchedSkills.ToList().AsReadOnly();
        MissingSkills = missingSkills.ToList().AsReadOnly();
        Suggestions = suggestions.ToList().AsReadOnly();
    }
}




