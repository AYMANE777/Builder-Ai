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
        Console.WriteLine($"[ResumeAnalyzerService] Analyzing text of length: {text?.Length ?? 0}");

        // 1. Personal Info
        if (string.IsNullOrEmpty(resume.CandidateName))
        {
            resume.CandidateName = ExtractName(text);
            Console.WriteLine($"[ResumeAnalyzerService] Extracted Name: {resume.CandidateName}");
        }

        if (string.IsNullOrEmpty(resume.Email))
        {
            resume.Email = ExtractEmail(text);
            Console.WriteLine($"[ResumeAnalyzerService] Extracted Email: {resume.Email}");
        }

        if (string.IsNullOrEmpty(resume.Phone))
        {
            resume.Phone = ExtractPhone(text);
            Console.WriteLine($"[ResumeAnalyzerService] Extracted Phone: {resume.Phone}");
        }

        resume.LinkedIn = ExtractLinkedIn(text);
        resume.Website = ExtractWebsite(text);
        resume.City = ExtractCity(text);
        resume.JobTitle = ExtractJobTitle(text);

        // 2. Sections
        ExtractExperiences(resume);
        ExtractEducation(resume);

        Console.WriteLine($"[ResumeAnalyzerService] Extracted Experiences Count: {resume.WorkExperiences.Count}");
        Console.WriteLine($"[ResumeAnalyzerService] Extracted Education Count: {resume.Education.Count}");
    }

    private string ExtractName(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        // Skip some common headers if they appear at the top
        foreach (var line in lines.Take(5))
        {
            var trimmed = line.Trim();
            if (trimmed.Length > 2 && !trimmed.Contains("@") && !Regex.IsMatch(trimmed, @"\d{5,}"))
                return trimmed;
        }
        return lines.Length > 0 ? lines[0].Trim() : "";
    }

    private string ExtractEmail(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var match = Regex.Match(text, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
        return match.Success ? match.Value : "";
    }

    private string ExtractPhone(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var match = Regex.Match(text, @"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}");
        return match.Success ? match.Value.Trim() : "";
    }

    private string ExtractLinkedIn(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var match = Regex.Match(text, @"linkedin\.com\/in\/[a-zA-Z0-9-]+");
        return match.Success ? "https://www." + match.Value : "";
    }

    private string ExtractWebsite(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var match = Regex.Match(text, @"(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+");
        return match.Success ? match.Value : "";
    }

    private string ExtractCity(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var lines = text.Split('\n');
        foreach (var line in lines.Take(15))
        {
            if (line.Contains("Location:", StringComparison.OrdinalIgnoreCase))
                return line.Replace("Location:", "", StringComparison.OrdinalIgnoreCase).Trim();
            
            // Look for "City, State" or "City, Country" pattern
            var match = Regex.Match(line, @"([A-Z][a-z]+(?: [A-Z][a-z]+)*),\s*[A-Z]{2,}");
            if (match.Success) return match.Value;
        }
        return "";
    }

    private string ExtractJobTitle(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var lines = text.Split('\n');
        // Look for common job title keywords in first 10 lines
        var keywords = new[] { "Developer", "Engineer", "Manager", "Analyst", "Lead", "Architect", "Consultant", "Designer" };
        foreach (var line in lines.Take(10))
        {
            if (keywords.Any(k => line.Contains(k, StringComparison.OrdinalIgnoreCase)))
                return line.Trim();
        }
        return lines.Length > 1 ? lines[1].Trim() : "";
    }

    private void ExtractExperiences(Resume resume)
    {
        var text = resume.RawText;
        if (string.IsNullOrWhiteSpace(text)) return;
        
        var sectionHeaders = new[] { "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "WORK HISTORY", "PROFESSIONAL EXPERIENCE" };
        int startIndex = -1;
        foreach (var header in sectionHeaders)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1) break;
        }

        if (startIndex == -1) return;

        var nextHeaders = new[] { "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "SUMMARY", "INTERESTS" };
        int endIndex = text.Length;
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 10, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex) endIndex = idx;
        }

        var expText = text.Substring(startIndex, endIndex - startIndex);
        
        // Improved splitting: look for years or month/year combinations
        var entrySplitPattern = @"(?m)^(?=.*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}/\d{2,4})\s*[\-\–\—]\s*(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}/\d{2,4}))";
        
        var entries = Regex.Split(expText, entrySplitPattern, RegexOptions.IgnoreCase);
        if (entries.Length <= 1)
        {
            // Fallback: split by year mentions if the complex pattern fails
            entries = Regex.Split(expText, @"(?m)^(?=.*(20\d{2}|19\d{2}))", RegexOptions.IgnoreCase);
        }
        
        foreach (var entry in entries.Skip(1).Take(10)) 
        {
            if (string.IsNullOrWhiteSpace(entry) || entry.Length < 10) continue;
            
            var lines = entry.Trim().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length == 0) continue;

            var firstLine = lines[0].Trim();
            var secondLine = lines.Length > 1 ? lines[1].Trim() : "";

            resume.AddWorkExperience(new WorkExperience
            {
                Company = firstLine.Contains("|") ? firstLine.Split('|')[0].Trim() : firstLine,
                Role = firstLine.Contains("|") ? firstLine.Split('|')[1].Trim() : (secondLine.Length > 0 ? secondLine : "Experience"),
                Responsibilities = string.Join(" ", lines.Skip(firstLine.Contains("|") ? 1 : 2)).Trim()
            });
        }
    }

    private void ExtractEducation(Resume resume)
    {
        var text = resume.RawText;
        if (string.IsNullOrWhiteSpace(text)) return;

        var sectionHeaders = new[] { "EDUCATION", "ACADEMIC", "QUALIFICATIONS", "STUDIES" };
        int startIndex = -1;
        foreach (var header in sectionHeaders)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1) break;
        }

        if (startIndex == -1) return;

        int endIndex = text.Length;
        var nextHeaders = new[] { "EXPERIENCE", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "WORK EXPERIENCE" };
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 10, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex) endIndex = idx;
        }

        var eduText = text.Substring(startIndex, endIndex - startIndex);
        var lines = eduText.Trim().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Skip(1).ToList();

        // Try to find multiple education entries
        for (int i = 0; i < lines.Count; i += 2)
        {
            if (i >= lines.Count) break;
            var school = lines[i].Trim();
            if (school.Length < 3) continue;

            var degree = (i + 1 < lines.Count) ? lines[i + 1].Trim() : "Degree/Certificate";
            
            resume.AddEducation(new Education
            {
                School = school,
                Degree = degree
            });
            
            if (resume.Education.Count >= 3) break;
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
