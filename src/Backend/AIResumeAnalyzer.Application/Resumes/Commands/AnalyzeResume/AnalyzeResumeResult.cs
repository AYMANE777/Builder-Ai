using AIResumeAnalyzer.Domain.Enums;

namespace AIResumeAnalyzer.Application.Resumes.Commands.AnalyzeResume;

public sealed record AnalyzeResumeResult(
    double CompatibilityScore,
    double SkillMatchPercentage,
    CandidateLevel PredictedLevel,
    IReadOnlyCollection<string> MatchedSkills,
    IReadOnlyCollection<string> MissingSkills);




