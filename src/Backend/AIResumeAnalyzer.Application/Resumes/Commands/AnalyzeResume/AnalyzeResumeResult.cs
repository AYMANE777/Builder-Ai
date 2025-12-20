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
    string ExtractedSummary,
    IReadOnlyCollection<WorkExperience> WorkExperiences,
    IReadOnlyCollection<Education> Education,
    IReadOnlyCollection<Volunteering> Volunteering,
    IReadOnlyCollection<LanguageInfo> Languages,
    IReadOnlyCollection<Certification> Certifications,
    IReadOnlyCollection<Project> Projects,
    string ResumeText,
    string JobDescriptionText,
    IReadOnlyCollection<string> ExtractedSkills,
    IReadOnlyCollection<string> MatchedSkills,
    IReadOnlyCollection<string> MissingSkills,
    IReadOnlyCollection<Suggestion> Suggestions);
