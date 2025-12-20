using AIResumeAnalyzer.Application.Common.Interfaces.Services;
using AIResumeAnalyzer.Domain.Entities;
using AIResumeAnalyzer.Domain.Enums;
using AIResumeAnalyzer.Domain.ValueObjects;
using AIResumeAnalyzer.Infrastructure.Nlp;
using System.Text.RegularExpressions;

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

        // Perform Advanced Extraction
        ExtractAllInformation(resume);

        // ATS Score Calculation
        double atsScore = CalculateAtsScore(resume, resumeSkills, matched.Count, jobSkills.Count);

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

        var suggestions = GenerateSuggestions(missing, atsScore);

        return new AnalysisResult(
            resume.Id,
            job.Id,
            compatibilityScore,
            Math.Round(skillMatch, 2),
            Math.Round(atsScore, 2),
            level,
            resume.CandidateName,
            resume.Email,
            resume.Phone,
            resume.JobTitle,
            resume.City,
            resume.LinkedIn,
            resume.Website,
            resume.WorkExperiences,
            resume.Education,
            resumeSkills,
            matched,
            missing,
            suggestions);
    }

    private void ExtractAllInformation(Resume resume)
    {
        string text = resume.RawText;

        // 1. Personal Info
        if (string.IsNullOrEmpty(resume.CandidateName))
            resume.CandidateName = ExtractName(text);

        if (string.IsNullOrEmpty(resume.Email))
            resume.Email = ExtractEmail(text);

        if (string.IsNullOrEmpty(resume.Phone))
            resume.Phone = ExtractPhone(text);

        resume.LinkedIn = ExtractLinkedIn(text);
        resume.Website = ExtractWebsite(text);
        resume.City = ExtractCity(text);
        resume.JobTitle = ExtractJobTitle(text);

        // 2. Sections (Very basic heuristic)
        ExtractExperiences(resume);
        ExtractEducation(resume);
    }

    private string ExtractName(string text)
    {
        var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        return lines.Length > 0 ? lines[0].Trim() : "";
    }

    private string ExtractEmail(string text)
    {
        var match = Regex.Match(text, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
        return match.Success ? match.Value : "";
    }

    private string ExtractPhone(string text)
    {
        var match = Regex.Match(text, @"\+?[\d\s-]{10,}");
        return match.Success ? match.Value.Trim() : "";
    }

    private string ExtractLinkedIn(string text)
    {
        var match = Regex.Match(text, @"linkedin\.com\/in\/[a-zA-Z0-9-]+");
        return match.Success ? "https://www." + match.Value : "";
    }

    private string ExtractWebsite(string text)
    {
        var match = Regex.Match(text, @"(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+");
        return match.Success ? match.Value : "";
    }

    private string ExtractCity(string text)
    {
        // Naive city extraction - look for "City, State" or just "City"
        // This is hard without a database, but we can look for common patterns
        var lines = text.Split('\n');
        foreach (var line in lines.Take(10))
        {
            if (line.Contains("Location:", StringComparison.OrdinalIgnoreCase))
                return line.Replace("Location:", "", StringComparison.OrdinalIgnoreCase).Trim();
        }
        return "";
    }

    private string ExtractJobTitle(string text)
    {
        var lines = text.Split('\n');
        if (lines.Length > 1) return lines[1].Trim(); // Often the second line
        return "";
    }

    private void ExtractExperiences(Resume resume)
    {
        var text = resume.RawText;
        
        // Better section detection
        var sectionHeaders = new[] { "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "WORK HISTORY", "PROFESSIONAL EXPERIENCE" };
        int startIndex = -1;
        foreach (var header in sectionHeaders)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1) break;
        }

        if (startIndex == -1) return;

        // Find end of section (next common header)
        var nextHeaders = new[] { "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "SUMMARY" };
        int endIndex = text.Length;
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 10, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex) endIndex = idx;
        }

        var expText = text.Substring(startIndex, endIndex - startIndex);
        
        // Split by date patterns or common entry starts
        // Pattern: Matches things like "Jan 2020", "2018 - 2022", "Present"
        var entries = Regex.Split(expText, @"(?m)^(?=.*(20\d{2}|19\d{2}|Present|Current))", RegexOptions.IgnoreCase);
        
        foreach (var entry in entries.Skip(1).Take(5)) // Skip header, take up to 5
        {
            if (string.IsNullOrWhiteSpace(entry) || entry.Length < 20) continue;
            
            var lines = entry.Trim().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length == 0) continue;

            // Simple heuristic: First line often contains Role or Company
            var firstLine = lines[0].Trim();
            var secondLine = lines.Length > 1 ? lines[1].Trim() : "";

            resume.AddWorkExperience(new WorkExperience
            {
                Company = firstLine.Contains("|") ? firstLine.Split('|')[0].Trim() : firstLine,
                Role = firstLine.Contains("|") ? firstLine.Split('|')[1].Trim() : (secondLine.Length > 0 ? secondLine : "Professional"),
                Responsibilities = string.Join(" ", lines.Skip(firstLine.Contains("|") ? 1 : 2)).Trim()
            });
        }
    }

    private void ExtractEducation(Resume resume)
    {
        var text = resume.RawText;
        var sectionHeaders = new[] { "EDUCATION", "ACADEMIC", "QUALIFICATIONS" };
        int startIndex = -1;
        foreach (var header in sectionHeaders)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1) break;
        }

        if (startIndex == -1) return;

        int endIndex = text.Length;
        var nextHeaders = new[] { "EXPERIENCE", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES" };
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 10, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex) endIndex = idx;
        }

        var eduText = text.Substring(startIndex, endIndex - startIndex);
        var lines = eduText.Trim().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Skip(1).ToList();

        if (lines.Count > 0)
        {
            resume.AddEducation(new Education
            {
                School = lines[0].Trim(),
                Degree = lines.Count > 1 ? lines[1].Trim() : "Degree"
            });
        }
    }

    private double CalculateAtsScore(Resume resume, IEnumerable<string> skills, int matchedCount, int totalJobSkills)
    {
        double score = 0;
        if (totalJobSkills > 0) score += (matchedCount / (double)totalJobSkills) * 40.0;
        else score += 20;

        if (!string.IsNullOrEmpty(resume.Email)) score += 5;
        if (!string.IsNullOrEmpty(resume.CandidateName)) score += 5;
        if (!string.IsNullOrEmpty(resume.Phone)) score += 5;
        if (!string.IsNullOrEmpty(resume.LinkedIn)) score += 5;

        int wordCount = resume.RawText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        if (wordCount >= 300 && wordCount <= 1000) score += 20;
        else if (wordCount > 100 && wordCount < 1500) score += 10;

        string[] headings = { "Experience", "Education", "Skills", "Projects", "Summary" };
        int headingsFound = headings.Count(h => resume.RawText.Contains(h, StringComparison.OrdinalIgnoreCase));
        score += (headingsFound / (double)headings.Length) * 20.0;

        return Math.Min(100, score);
    }

    private List<Suggestion> GenerateSuggestions(List<string> missing, double atsScore)
    {
        var suggestions = new List<Suggestion>();
        if (missing.Any())
        {
            suggestions.Add(new Suggestion(
                "Skills",
                "Existing skills list",
                $"Add the following skills: {string.Join(", ", missing.Take(5))}",
                "These skills are missing from your resume but highly relevant to the job."));
        }

        if (atsScore < 75)
        {
            suggestions.Add(new Suggestion(
                "ATS Optimization",
                "Resume Structure",
                "Improve resume formatting and contact information.",
                "Ensure your LinkedIn and Portfolio links are present and clickable. Use standard section headers."));
        }

        return suggestions;
    }
}
