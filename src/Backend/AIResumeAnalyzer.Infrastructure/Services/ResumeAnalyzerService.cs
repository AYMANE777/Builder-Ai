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
            resume.Summary,
            resume.WorkExperiences,
            resume.Education,
            resume.Volunteering,
            resume.Languages,
            resume.Certifications,
            resume.Projects,
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
        if (string.IsNullOrEmpty(resume.CandidateName) || resume.CandidateName == "Unknown")
        {
            resume.CandidateName = ExtractName(text);
        }

        if (string.IsNullOrEmpty(resume.Email))
        {
            resume.Email = ExtractEmail(text);
        }

        if (string.IsNullOrEmpty(resume.Phone))
        {
            resume.Phone = ExtractPhone(text);
        }

        resume.LinkedIn = ExtractLinkedIn(text);
        resume.Website = ExtractWebsite(text);
        resume.City = ExtractCity(text);
        resume.JobTitle = ExtractJobTitle(text);
        resume.Summary = ExtractSummary(text);

        // 2. Sections
        ExtractExperiences(resume);
        ExtractEducation(resume);
        ExtractVolunteering(resume);
        ExtractLanguages(resume);
        ExtractCertifications(resume);
        ExtractProjects(resume);
        ExtractSkillsFromSection(resume);

        Console.WriteLine($"[ResumeAnalyzerService] Final Extracted - Name: {resume.CandidateName}, Experiences: {resume.WorkExperiences.Count}, Education: {resume.Education.Count}");
    }

    private void ExtractSkillsFromSection(Resume resume)
    {
        var headers = new[] { "SKILLS", "COMPÉTENCES", "COMPÉTENCES COMPLÉMENTAIRES", "TECHNOLOGIES", "TECH STACK", "INFORMATIONS COMPLÉMENTAIRES", "SKILLS & EXPERTISE" };
        var sectionText = ExtractSection(resume.RawText, headers);
        if (string.IsNullOrWhiteSpace(sectionText)) return;

        var separators = new[] { ',', ';', '•', '|', '\n', '\r', '·' };
        var skills = sectionText.Split(separators, StringSplitOptions.RemoveEmptyEntries);
        foreach (var s in skills)
        {
            var trimmed = s.Trim();
            if (trimmed.Length > 1 && trimmed.Length < 50 && !trimmed.Contains(":") && !trimmed.Contains("http"))
            {
                resume.AddSkill(new Skill(trimmed, "extracted"));
            }
        }
    }

    private string ExtractSummary(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var sectionHeaders = new[] { "SUMMARY", "PROFESSIONAL SUMMARY", "PROFILE", "ABOUT ME", "OBJECTIVE", "RÉSUMÉ", "SYNTHÈSE", "À PROPOS DE MOI", "PROFIL" };
        return ExtractSection(text, sectionHeaders);
    }

    private string ExtractSection(string text, string[] headers)
    {
        int startIndex = -1;
        foreach (var header in headers)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1)
            {
                int lineStart = text.LastIndexOf('\n', startIndex);
                if (lineStart == -1 || (startIndex - lineStart) < 10)
                {
                    startIndex += header.Length;
                    break;
                }
                startIndex = -1;
            }
        }

        if (startIndex == -1) return "";

        var nextHeaders = new[] { 
            "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "VOLUNTEERING", "WORK EXPERIENCE", 
            "FORMATION", "COMPÉTENCES", "PROJETS", "BÉNÉVOLAT", "LANGUES", "LOISIRS", "INTERESTS", "INFORMATIONS COMPLÉMENTAIRES", "STAGES" 
        };
        int endIndex = text.Length;
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 5, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex)
            {
                int lineStart = text.LastIndexOf('\n', idx);
                if (lineStart == -1 || (idx - lineStart) < 10)
                {
                    endIndex = idx;
                }
            }
        }

        return text.Substring(startIndex, endIndex - startIndex).Trim();
    }

    private string ExtractName(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var lines = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines.Take(5))
        {
            var trimmed = line.Trim();
            if (trimmed.Length > 2 && !trimmed.Contains("@") && !Regex.IsMatch(trimmed, @"\d{5,}"))
                return trimmed;
        }
        return lines.Length > 0 ? lines[0].Trim() : "Candidate Name";
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
        if (!match.Success)
        {
            match = Regex.Match(text, @"(\+\d{1,3}[\s-]?)?(\d[\s-]?){8,12}");
        }
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
        var lines = text.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        var labels = new[] { "Location:", "Adresse:", "Address:", "Domicile:", "Localisation:", "Ville:", "City:" };
        
        foreach (var line in lines.Take(25))
        {
            var trimmed = line.Trim();
            foreach (var label in labels)
            {
                if (trimmed.StartsWith(label, StringComparison.OrdinalIgnoreCase))
                    return trimmed.Substring(label.Length).Trim();
            }

            var match = Regex.Match(trimmed, @"^[A-Z][a-zàâçéèêëîïôûù]+(?:[\s-][A-Z][a-zàâçéèêëîïôûù]+)*,\s*[A-Z][a-zàâçéèêëîïôûù]+(?:[\s-][A-Z][a-zàâçéèêëîïôûù]+)*$");
            if (match.Success) return match.Value;
            
            if (trimmed.Length > 2 && trimmed.Length < 25 && !trimmed.Contains("@") && !trimmed.Contains("http") && !Regex.IsMatch(trimmed, @"\d{5,}") && trimmed.Split(' ').Length <= 3)
            {
                if (line.Contains("|") || line.Contains("•") || line.Contains("–") || line.Contains("-"))
                {
                    var parts = trimmed.Split(new[] { '|', '•', '–', '-', ',' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var part in parts)
                    {
                        var p = part.Trim();
                        if (p.Length > 2 && p.Length < 20 && !p.Any(char.IsDigit) && !p.Contains("@"))
                            return p;
                    }
                }
            }
        }
        return "";
    }

    private string ExtractJobTitle(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var lines = text.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        var keywords = new[] { 
            "Developer", "Engineer", "Manager", "Analyst", "Lead", "Architect", "Consultant", "Designer", "Specialist", "Administrator",
            "Développeur", "Ingénieur", "Responsable", "Analyste", "Consultant", "Concepteur", "Spécialiste", "Administrateur", "Chef de projet",
            "Fullstack", "Frontend", "Backend", "Software", "Logiciel", "Data Scientist", "Product Owner", "Technicien", "Stagiaire", "Stage"
        };

        var name = ExtractName(text);
        for (int i = 0; i < Math.Min(lines.Length, 15); i++)
        {
            var trimmed = lines[i].Trim();
            if (string.Equals(trimmed, name, StringComparison.OrdinalIgnoreCase)) continue;
            if (trimmed.Contains("@") || Regex.IsMatch(trimmed, @"\d{10,}")) continue; 
            if (keywords.Any(k => trimmed.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                var headers = new[] { "EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY", "EXPÉRIENCE", "FORMATION", "COMPÉTENCES", "STAGES", "PROJECTS" };
                if (headers.Any(h => string.Equals(trimmed, h, StringComparison.OrdinalIgnoreCase))) continue;
                return trimmed;
            }
        }
        return "";
    }

    private void ExtractExperiences(Resume resume)
    {
        var sectionHeaders = new[] { 
            "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "WORK HISTORY", "PROFESSIONAL EXPERIENCE", 
            "EXPÉRIENCE PROFESSIONNELLE", "EXPÉRIENCES PROFESSIONNELLES", "EXPÉRIENCE", "EXPÉRIENCES",
            "STAGES ET EXPÉRIENCES", "PARCOURS PROFESSIONNEL"
        };
        var expText = ExtractSection(resume.RawText, sectionHeaders);
        if (string.IsNullOrWhiteSpace(expText)) return;

        var lines = expText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        var months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre";
        var dateRangePattern = $@"(?:{months}|\d{{1,2}}/\d{{2,4}}|\b20\d{{2}}\b)\s*[\-\–\—\s]+(?:Present|Current|Présent|Aujourd'hui|{months}|\d{{1,2}}/\d{{2,4}}|\b20\d{{2}}\b)";
        
        WorkExperience currentExp = null;
        foreach (var line in lines)
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.Length < 3) continue;

            bool isNewEntry = Regex.IsMatch(trimmedLine, dateRangePattern, RegexOptions.IgnoreCase) || 
                             (trimmedLine.Contains(" – ") || trimmedLine.Contains(" - ") || trimmedLine.Contains(" | ")) && trimmedLine.Length < 150;

            if (isNewEntry && (currentExp == null || !trimmedLine.StartsWith("•") && !trimmedLine.StartsWith("-")))
            {
                if (currentExp != null) resume.AddWorkExperience(currentExp);
                currentExp = new WorkExperience();
                var parts = trimmedLine.Split(new[] { " | ", "|", " – ", " - ", " @ " }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length >= 2)
                {
                    currentExp.Role = parts[0].Trim();
                    currentExp.Company = parts[1].Trim();
                    if (parts.Length >= 3) currentExp.Location = parts[2].Trim();
                }
                else
                {
                    currentExp.Role = trimmedLine;
                    currentExp.Company = "Company";
                }
            }
            else if (currentExp != null)
            {
                currentExp.Responsibilities += (string.IsNullOrEmpty(currentExp.Responsibilities) ? "" : "\n") + trimmedLine;
            }
            if (resume.WorkExperiences.Count >= 10) break;
        }
        if (currentExp != null) resume.AddWorkExperience(currentExp);
    }

    private void ExtractEducation(Resume resume)
    {
        var sectionHeaders = new[] { "EDUCATION", "ACADEMIC", "QUALIFICATIONS", "STUDIES", "FORMATION", "PARCOURS ACADÉMIQUE", "DIPLÔMES" };
        var eduText = ExtractSection(resume.RawText, sectionHeaders);
        if (string.IsNullOrWhiteSpace(eduText)) return;

        var lines = eduText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            if (line.Length < 5) continue;
            var degreeKeywords = new[] { "Cycle", "Diplôme", "Master", "Licence", "Bachelor", "Bac", "Doctorat", "Ingénieur", "Formation" };
            if (degreeKeywords.Any(k => line.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                var entry = new Education { Degree = line };
                if (i + 1 < lines.Length)
                {
                    var nextLine = lines[i+1].Trim();
                    if (nextLine.Length > 5 && !degreeKeywords.Any(k => nextLine.Contains(k, StringComparison.OrdinalIgnoreCase)))
                    {
                        entry.School = nextLine;
                        i++;
                    }
                }
                resume.AddEducation(entry);
            }
            if (resume.Education.Count >= 5) break;
        }
    }

    private void ExtractVolunteering(Resume resume)
    {
        var sectionHeaders = new[] { "VOLUNTEERING", "LEADERSHIP", "COMMUNITY SERVICE", "BÉNÉVOLAT", "VIE ASSOCIATIVE" };
        var sectionText = ExtractSection(resume.RawText, sectionHeaders);
        if (string.IsNullOrWhiteSpace(sectionText)) return;

        var lines = sectionText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines.Take(5))
        {
            if (line.Length < 5) continue;
            resume.AddVolunteering(new Volunteering { Organization = line.Trim(), Description = line.Trim() });
        }
    }

    private void ExtractLanguages(Resume resume)
    {
        var sectionHeaders = new[] { "LANGUAGES", "LANGUES" };
        var sectionText = ExtractSection(resume.RawText, sectionHeaders);
        if (string.IsNullOrWhiteSpace(sectionText)) return;

        var lines = sectionText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines)
        {
            var parts = line.Split(new[] { ':', '-', '|', '(' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                resume.AddLanguage(new LanguageInfo { Language = parts[0].Trim(), Fluency = parts[1].Trim().Replace(")", "") });
            else if (line.Trim().Length > 2)
                resume.AddLanguage(new LanguageInfo { Language = line.Trim(), Fluency = "Native/Fluent" });
        }
    }

    private void ExtractCertifications(Resume resume)
    {
        var sectionHeaders = new[] { "CERTIFICATIONS", "CERTIFICATES", "LICENSES", "CERTIFICATIONS ET LICENCES" };
        var sectionText = ExtractSection(resume.RawText, sectionHeaders);
        if (string.IsNullOrWhiteSpace(sectionText)) return;

        var lines = sectionText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines)
        {
            if (line.Trim().Length > 5)
                resume.AddCertification(new Certification { Name = line.Trim() });
        }
    }

    private void ExtractProjects(Resume resume)
    {
        var sectionHeaders = new[] { "PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS", "PROJETS", "REALISATIONS" };
        var sectionText = ExtractSection(resume.RawText, sectionHeaders);
        if (string.IsNullOrWhiteSpace(sectionText)) return;

        var lines = sectionText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines.Take(10))
        {
            if (line.Trim().Length > 10)
                resume.AddProject(new Project { Title = line.Trim(), Description = line.Trim() });
        }
    }

    private double CalculateAtsScore(Resume resume, IEnumerable<string> skills, int matchedCount, int totalJobSkills)
    {
        double score = 0;
        if (totalJobSkills > 0) score += (matchedCount / (double)totalJobSkills) * 40.0;
        else score += 20;

        if (!string.IsNullOrEmpty(resume.Email)) score += 5;
        if (!string.IsNullOrEmpty(resume.CandidateName) && resume.CandidateName != "Candidate Name") score += 5;
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
