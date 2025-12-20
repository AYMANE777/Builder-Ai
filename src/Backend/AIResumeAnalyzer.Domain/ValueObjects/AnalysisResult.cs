using AIResumeAnalyzer.Domain.Enums;
using AIResumeAnalyzer.Domain.Entities;

namespace AIResumeAnalyzer.Domain.ValueObjects;

public class AnalysisResult
{
    public Guid ResumeId { get; }
    public Guid JobId { get; }
    public double CompatibilityScore { get; }
    public double SkillMatchPercentage { get; }
    public double AtsScore { get; }
    public CandidateLevel PredictedLevel { get; }
    
    // Extracted Info
    public string ExtractedName { get; }
    public string ExtractedEmail { get; }
    public string ExtractedPhone { get; }
    public string ExtractedJobTitle { get; }
    public string ExtractedCity { get; }
    public string ExtractedLinkedIn { get; }
    public string ExtractedWebsite { get; }
    public string ExtractedSummary { get; }
    
    public IReadOnlyCollection<WorkExperience> WorkExperiences { get; }
    public IReadOnlyCollection<Education> Education { get; }
    public IReadOnlyCollection<Volunteering> Volunteering { get; }
    public IReadOnlyCollection<LanguageInfo> Languages { get; }
    public IReadOnlyCollection<Certification> Certifications { get; }
    public IReadOnlyCollection<Project> Projects { get; }
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
        string extractedJobTitle,
        string extractedCity,
        string extractedLinkedIn,
        string extractedWebsite,
        string extractedSummary,
        IEnumerable<WorkExperience> workExperiences,
        IEnumerable<Education> education,
        IEnumerable<Volunteering> volunteering,
        IEnumerable<LanguageInfo> languages,
        IEnumerable<Certification> certifications,
        IEnumerable<Project> projects,
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
        ExtractedJobTitle = extractedJobTitle;
        ExtractedCity = extractedCity;
        ExtractedLinkedIn = extractedLinkedIn;
        ExtractedWebsite = extractedWebsite;
        ExtractedSummary = extractedSummary;
        WorkExperiences = workExperiences.ToList().AsReadOnly();
        Education = education.ToList().AsReadOnly();
        Volunteering = volunteering.ToList().AsReadOnly();
        Languages = languages.ToList().AsReadOnly();
        Certifications = certifications.ToList().AsReadOnly();
        Projects = projects.ToList().AsReadOnly();
        ExtractedSkills = extractedSkills.ToList().AsReadOnly();
        MatchedSkills = matchedSkills.ToList().AsReadOnly();
        MissingSkills = missingSkills.ToList().AsReadOnly();
        Suggestions = suggestions.ToList().AsReadOnly();
    }
}
