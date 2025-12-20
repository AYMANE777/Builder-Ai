using AIResumeAnalyzer.Domain.Enums;
using AIResumeAnalyzer.Domain.ValueObjects;
using AIResumeAnalyzer.Domain.Entities;

namespace AIResumeAnalyzer.Application.Resumes.Commands.AnalyzeResume;

public sealed record AnalyzeResumeResult(
    double CompatibilityScore,
    double SkillMatchPercentage,
    double AtsScore,
    CandidateLevel PredictedLevel,
    string ExtractedName,
    string ExtractedEmail,
    string ExtractedPhone,
    string ExtractedJobTitle,
    string ExtractedCity,
    string ExtractedLinkedIn,
    string ExtractedWebsite,
    IReadOnlyCollection<WorkExperience> WorkExperiences,
    IReadOnlyCollection<Education> Education,
    string ResumeText,
    string JobDescriptionText,
    IReadOnlyCollection<string> ExtractedSkills,
    IReadOnlyCollection<string> MatchedSkills,
    IReadOnlyCollection<string> MissingSkills,
    IReadOnlyCollection<Suggestion> Suggestions);
