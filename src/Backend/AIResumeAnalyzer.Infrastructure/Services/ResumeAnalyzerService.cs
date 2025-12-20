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
        resume.Summary = ExtractSummary(text);

        // 2. Sections
        ExtractExperiences(resume);
        ExtractEducation(resume);
        ExtractVolunteering(resume);
        ExtractLanguages(resume);
        ExtractCertifications(resume);
        ExtractProjects(resume);

        Console.WriteLine($"[ResumeAnalyzerService] Extracted Experiences Count: {resume.WorkExperiences.Count}");
        Console.WriteLine($"[ResumeAnalyzerService] Extracted Education Count: {resume.Education.Count}");
    }

    private string ExtractSummary(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var sectionHeaders = new[] { "SUMMARY", "PROFESSIONAL SUMMARY", "PROFILE", "ABOUT ME", "OBJECTIVE", "RÉSUMÉ", "SYNTHÈSE" };
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
                startIndex += header.Length;
                break;
            }
        }

        if (startIndex == -1) return "";

        var nextHeaders = new[] { "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "VOLUNTEERING", "WORK EXPERIENCE", "FORMATION", "COMPÉTENCES", "PROJETS", "BÉNÉVOLAT" };
        int endIndex = text.Length;
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 5, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex) endIndex = idx;
        }

        return text.Substring(startIndex, endIndex - startIndex).Trim();
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
        if (!match.Success)
        {
            // Try international/simpler format
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
        var lines = text.Split('\n');
        
        // common labels for location
        var labels = new[] { "Location:", "Adresse:", "Address:", "Domicile:", "Localisation:" };
        
        foreach (var line in lines.Take(20))
        {
            var trimmed = line.Trim();
            foreach (var label in labels)
            {
                if (trimmed.StartsWith(label, StringComparison.OrdinalIgnoreCase))
                {
                    return trimmed.Substring(label.Length).Trim();
                }
            }

            // Look for "City, Country" or "City, State" or just "City" if it's a known format
            // Pattern: Word, Word (e.g. Paris, France or New York, NY)
            var match = Regex.Match(trimmed, @"^[A-Z][a-zàâçéèêëîïôûù]+(?:[\s-][A-Z][a-zàâçéèêëîïôûù]+)*,\s*[A-Z][a-zàâçéèêëîïôûù]+(?:[\s-][A-Z][a-zàâçéèêëîïôûù]+)*$");
            if (match.Success) return match.Value;
            
            // Postal code patterns (FR: 5 digits, US: 5 digits)
            var zipMatch = Regex.Match(trimmed, @"\b\d{5}\b");
            if (zipMatch.Success && trimmed.Length < 50) return trimmed;
        }
        return "";
    }

    private string ExtractJobTitle(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var lines = text.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        
        // Common job title keywords
        var keywords = new[] { 
            "Developer", "Engineer", "Manager", "Analyst", "Lead", "Architect", "Consultant", "Designer", "Specialist", "Administrator",
            "Développeur", "Ingénieur", "Responsable", "Analyste", "Consultant", "Concepteur", "Spécialiste", "Administrateur", "Chef de projet",
            "Fullstack", "Frontend", "Backend", "Software", "Logiciel", "Data Scientist", "Product Owner"
        };

        // Skip the name line (usually line 0 or 1)
        var name = ExtractName(text);
        
        foreach (var line in lines.Take(15))
        {
            var trimmed = line.Trim();
            if (string.Equals(trimmed, name, StringComparison.OrdinalIgnoreCase)) continue;
            if (trimmed.Contains("@") || Regex.IsMatch(trimmed, @"\d{10,}")) continue; // Skip email/phone
            
            if (keywords.Any(k => trimmed.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                // Ensure it's not a section header
                var headers = new[] { "EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY", "EXPÉRIENCE", "FORMATION", "COMPÉTENCES" };
                if (headers.Any(h => string.Equals(trimmed, h, StringComparison.OrdinalIgnoreCase))) continue;
                
                return trimmed;
            }
        }
        
        // Fallback: if we found a "Summary" or "Objective" header, look at the line above it or the first non-empty line after name
        return lines.Length > 1 ? lines[1].Trim() : "";
    }

    private void ExtractExperiences(Resume resume)
    {
        var text = resume.RawText;
        if (string.IsNullOrWhiteSpace(text)) return;
        
        var sectionHeaders = new[] { 
            "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "WORK HISTORY", "PROFESSIONAL EXPERIENCE", 
            "EXPÉRIENCE PROFESSIONNELLE", "EXPÉRIENCES PROFESSIONNELLES", "EXPÉRIENCE", "EXPÉRIENCES" 
        };
        
        int startIndex = -1;
        foreach (var header in sectionHeaders)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1)
            {
                // Verify it's likely a header (shorter line)
                int lineEnd = text.IndexOf('\n', startIndex);
                if (lineEnd != -1 && (lineEnd - startIndex) < 40)
                {
                    startIndex = lineEnd;
                    break;
                }
                startIndex = -1; // reset if it looks like body text
            }
        }

        if (startIndex == -1) return;

        var nextHeaders = new[] { "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "SUMMARY", "INTERESTS", "FORMATION", "COMPÉTENCES", "PROJETS", "BÉNÉVOLAT", "VOLUNTEERING" };
        int endIndex = text.Length;
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 5, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex)
            {
                 // Verify it's a header
                 int lineStart = text.LastIndexOf('\n', idx);
                 int lineEnd = text.IndexOf('\n', idx);
                 if (lineEnd == -1) lineEnd = text.Length;
                 if ((lineEnd - (lineStart == -1 ? 0 : lineStart)) < 40)
                 {
                    endIndex = idx;
                 }
            }
        }

        var expText = text.Substring(startIndex, endIndex - startIndex).Trim();
        
        // Improved splitting: look for years or month/year combinations or bullet points that look like new entries
        var months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre";
        
        // Match lines that contain a date range: e.g. "2020 - 2022" or "Jan 2020 to Present"
        var dateRangePattern = $@"(?:{months}|\d{{1,2}}/\d{{2,4}}|\b20\d{{2}}\b)\s*[\-\–\—\s]+(?:Present|Current|Présent|Aujourd'hui|{months}|\d{{1,2}}/\d{{2,4}}|\b20\d{{2}}\b)";
        
        // Split by lines that look like a new job entry (often starts with date or company name)
        var lines = expText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        
        WorkExperience currentExp = null;
        
        foreach (var line in lines)
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmedLine)) continue;

            bool isNewEntry = Regex.IsMatch(trimmedLine, dateRangePattern, RegexOptions.IgnoreCase) || 
                             (trimmedLine.Length < 100 && (trimmedLine.Contains("|") || trimmedLine.Contains(" - ") || trimmedLine.Contains(" @ ")));

            if (isNewEntry && (currentExp == null || trimmedLine.Length > 5))
            {
                if (currentExp != null) resume.AddWorkExperience(currentExp);
                
                currentExp = new WorkExperience();
                
                // Try to parse Company and Role from the line
                if (trimmedLine.Contains("|"))
                {
                    var parts = trimmedLine.Split('|');
                    currentExp.Company = parts[0].Trim();
                    currentExp.Role = parts.Length > 1 ? parts[1].Trim() : "Role";
                }
                else if (trimmedLine.Contains(" @ "))
                {
                    var parts = trimmedLine.Split(new[] { " @ " }, StringSplitOptions.None);
                    currentExp.Role = parts[0].Trim();
                    currentExp.Company = parts.Length > 1 ? parts[1].Trim() : "Company";
                }
                else if (Regex.IsMatch(trimmedLine, dateRangePattern, RegexOptions.IgnoreCase))
                {
                    // If it's just a date line, the next line might be the company/role
                    currentExp.Responsibilities = trimmedLine; 
                }
                else
                {
                    currentExp.Company = trimmedLine;
                    currentExp.Role = "Professional Experience";
                }
            }
            else if (currentExp != null)
            {
                if (string.IsNullOrEmpty(currentExp.Role) || currentExp.Role == "Professional Experience")
                {
                    currentExp.Role = trimmedLine;
                }
                else
                {
                    currentExp.Responsibilities += (string.IsNullOrEmpty(currentExp.Responsibilities) ? "" : " ") + trimmedLine;
                }
            }
            
            if (resume.WorkExperiences.Count >= 10) break;
        }
        
        if (currentExp != null) resume.AddWorkExperience(currentExp);
    }


    private void ExtractEducation(Resume resume)
    {
        var text = resume.RawText;
        if (string.IsNullOrWhiteSpace(text)) return;

        var sectionHeaders = new[] { "EDUCATION", "ACADEMIC", "QUALIFICATIONS", "STUDIES", "FORMATION", "PARCOURS ACADÉMIQUE" };
        int startIndex = -1;
        foreach (var header in sectionHeaders)
        {
            startIndex = text.IndexOf(header, StringComparison.OrdinalIgnoreCase);
            if (startIndex != -1)
            {
                startIndex += header.Length;
                break;
            }
        }

        if (startIndex == -1) return;

        int endIndex = text.Length;
        var nextHeaders = new[] { "EXPERIENCE", "SKILLS", "PROJECTS", "CERTIFICATIONS", "LANGUAGES", "WORK EXPERIENCE", "EXPÉRIENCE" };
        foreach (var header in nextHeaders)
        {
            int idx = text.IndexOf(header, startIndex + 5, StringComparison.OrdinalIgnoreCase);
            if (idx != -1 && idx < endIndex) endIndex = idx;
        }

        var eduText = text.Substring(startIndex, endIndex - startIndex);
        var lines = eduText.Trim().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).ToList();

        // Try to find multiple education entries
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i].Trim();
            if (line.Length < 3 || line.Any(char.IsDigit) && line.Length < 10) continue;

            var school = line;
            var degree = (i + 1 < lines.Count) ? lines[i + 1].Trim() : "Degree/Certificate";
            
            resume.AddEducation(new Education
            {
                School = school,
                Degree = degree
            });
            
            i++; // skip next line as it was used for degree
            if (resume.Education.Count >= 5) break;
        }
    }

    private void ExtractVolunteering(Resume resume)
    {
        var text = resume.RawText;
        var sectionHeaders = new[] { "VOLUNTEERING", "LEADERSHIP", "COMMUNITY SERVICE", "BÉNÉVOLAT", "VIE ASSOCIATIVE" };
        var sectionText = ExtractSection(text, sectionHeaders);
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
        var text = resume.RawText;
        var sectionHeaders = new[] { "LANGUAGES", "LANGUES" };
        var sectionText = ExtractSection(text, sectionHeaders);
        if (string.IsNullOrWhiteSpace(sectionText)) return;

        var lines = sectionText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines)
        {
            var parts = line.Split(new[] { ':', '-', '|', '(' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
            {
                resume.AddLanguage(new LanguageInfo { Language = parts[0].Trim(), Fluency = parts[1].Trim().Replace(")", "") });
            }
            else if (line.Trim().Length > 2)
            {
                resume.AddLanguage(new LanguageInfo { Language = line.Trim(), Fluency = "Native/Fluent" });
            }
        }
    }

    private void ExtractCertifications(Resume resume)
    {
        var text = resume.RawText;
        var sectionHeaders = new[] { "CERTIFICATIONS", "CERTIFICATES", "LICENSES", "CERTIFICATIONS ET LICENCES" };
        var sectionText = ExtractSection(text, sectionHeaders);
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
        var text = resume.RawText;
        var sectionHeaders = new[] { "PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS", "PROJETS", "REALISATIONS" };
        var sectionText = ExtractSection(text, sectionHeaders);
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
