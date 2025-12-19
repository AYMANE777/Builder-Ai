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

        // Extract contact info if missing
        string extractedPhone = ExtractPhone(resume.RawText);
        string extractedEmail = string.IsNullOrEmpty(resume.Email) ? ExtractEmail(resume.RawText) : resume.Email;
        string extractedName = string.IsNullOrEmpty(resume.CandidateName) ? ExtractName(resume.RawText) : resume.CandidateName;

        var suggestions = new List<Suggestion>();
        if (missing.Any())
        {
            suggestions.Add(new Suggestion(
                "Skills",
                "Existing skills list",
                $"Add the following skills: {string.Join(", ", missing)}",
                "These skills are required or preferred in the job description but missing from your resume."));

            foreach (var skill in missing.Take(2))
            {
                suggestions.Add(new Suggestion(
                    "Experience",
                    "[Placeholder for experience context]",
                    $"Mention your experience with {skill} in a recent project.",
                    $"Highlighting {skill} in your experience section will significantly improve your match score."));
            }
        }

        if (atsScore < 70)
        {
            suggestions.Add(new Suggestion(
                "ATS Optimization",
                "Resume Structure",
                "Improve resume formatting and contact information.",
                "Your ATS score is low. Ensure you have clear headings, standard fonts, and all contact details (Phone, Email, LinkedIn)."));
        }

        return new AnalysisResult(
            resume.Id,
            job.Id,
            compatibilityScore,
            Math.Round(skillMatch, 2),
            Math.Round(atsScore, 2),
            level,
            extractedName,
            extractedEmail,
            extractedPhone,
            resumeSkills,
            matched,
            missing,
            suggestions);
    }

    private double CalculateAtsScore(Resume resume, List<string> skills, int matchedCount, int totalJobSkills)
    {
        double score = 0;

        // 1. Skill Match (40%)
        if (totalJobSkills > 0)
        {
            score += (matchedCount / (double)totalJobSkills) * 40.0;
        }
        else
        {
            score += 20; // Default if no job skills provided
        }

        // 2. Contact Info (20%)
        if (!string.IsNullOrEmpty(resume.Email)) score += 7;
        if (!string.IsNullOrEmpty(resume.CandidateName)) score += 7;
        if (System.Text.RegularExpressions.Regex.IsMatch(resume.RawText, @"\+?[\d\s-]{10,}")) score += 6;

        // 3. Content Length & Structure (20%)
        int wordCount = resume.RawText.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        if (wordCount >= 300 && wordCount <= 1000) score += 20;
        else if (wordCount > 100 && wordCount < 1500) score += 10;

        // 4. Formatting/Keywords (20%)
        // Simple check for common headings
        string[] headings = { "Experience", "Education", "Skills", "Projects", "Summary" };
        int headingsFound = headings.Count(h => resume.RawText.Contains(h, StringComparison.OrdinalIgnoreCase));
        score += (headingsFound / (double)headings.Length) * 20.0;

        return Math.Min(100, score);
    }

    private string ExtractPhone(string text)
    {
        var match = System.Text.RegularExpressions.Regex.Match(text, @"\+?[\d\s-]{10,}");
        return match.Success ? match.Value.Trim() : "";
    }

    private string ExtractEmail(string text)
    {
        var match = System.Text.RegularExpressions.Regex.Match(text, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
        return match.Success ? match.Value : "";
    }

    private string ExtractName(string text)
    {
        // Very naive name extraction - usually the first line
        var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        return lines.Length > 0 ? lines[0].Trim() : "";
    }
}

