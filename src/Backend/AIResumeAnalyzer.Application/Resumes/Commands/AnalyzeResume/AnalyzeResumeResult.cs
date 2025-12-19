using AIResumeAnalyzer.Domain.Enums;
using AIResumeAnalyzer.Domain.ValueObjects;

namespace AIResumeAnalyzer.Application.Resumes.Commands.AnalyzeResume;

public sealed record AnalyzeResumeResult(
    double CompatibilityScore,
    double SkillMatchPercentage,
    double AtsScore,
    CandidateLevel PredictedLevel,
    string ExtractedName,
    string ExtractedEmail,
    string ExtractedPhone,
    IReadOnlyCollection<string> ExtractedSkills,
    IReadOnlyCollection<string> MatchedSkills,
    IReadOnlyCollection<string> MissingSkills,
    IReadOnlyCollection<Suggestion> Suggestions);




