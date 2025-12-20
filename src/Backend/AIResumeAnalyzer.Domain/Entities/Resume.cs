using System.ComponentModel.DataAnnotations.Schema;

namespace AIResumeAnalyzer.Domain.Entities;

public class Resume
{
    public Guid Id { get; private set; }
    public string CandidateName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string ProfilePhotoUrl { get; set; } = string.Empty;
    public string RawText { get; private set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Language { get; private set; } = "en";
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<WorkExperience> _workExperiences = new();
    public IReadOnlyCollection<WorkExperience> WorkExperiences => _workExperiences.AsReadOnly();

    private readonly List<Education> _education = new();
    public IReadOnlyCollection<Education> Education => _education.AsReadOnly();

    private readonly List<Skill> _skills = new();
    [NotMapped]
    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();

    private readonly List<Volunteering> _volunteering = new();
    public IReadOnlyCollection<Volunteering> Volunteering => _volunteering.AsReadOnly();

    private readonly List<LanguageInfo> _languages = new();
    public IReadOnlyCollection<LanguageInfo> Languages => _languages.AsReadOnly();

    private readonly List<Certification> _certifications = new();
    public IReadOnlyCollection<Certification> Certifications => _certifications.AsReadOnly();

    private readonly List<Project> _projects = new();
    public IReadOnlyCollection<Project> Projects => _projects.AsReadOnly();
    
    internal List<Skill> GetSkillsInternal() => _skills;

    private Resume() { }

    public Resume(string candidateName, string email, string rawText, string language)
    {
        Id = Guid.NewGuid();
        CandidateName = candidateName;
        Email = email;
        RawText = rawText;
        Language = language;
    }

    public void AddSkill(Skill skill)
    {
        if (_skills.Any(s => s.Name.Equals(skill.Name, StringComparison.OrdinalIgnoreCase)))
            return;

        _skills.Add(skill);
    }

    public void AddWorkExperience(WorkExperience experience) => _workExperiences.Add(experience);
    public void AddEducation(Education education) => _education.Add(education);
    public void AddVolunteering(Volunteering volunteering) => _volunteering.Add(volunteering);
    public void AddLanguage(LanguageInfo language) => _languages.Add(language);
    public void AddCertification(Certification certification) => _certifications.Add(certification);
    public void AddProject(Project project) => _projects.Add(project);
}

public class WorkExperience
{
    public Guid Id { get; private set; }
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Responsibilities { get; set; } = string.Empty;

    public WorkExperience() => Id = Guid.NewGuid();
}

public class Education
{
    public Guid Id { get; private set; }
    public string School { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;

    public Education() => Id = Guid.NewGuid();
}

public class Volunteering
{
    public Guid Id { get; private set; }
    public string Organization { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public Volunteering() => Id = Guid.NewGuid();
}

public class LanguageInfo
{
    public Guid Id { get; private set; }
    public string Language { get; set; } = string.Empty;
    public string Fluency { get; set; } = string.Empty;

    public LanguageInfo() => Id = Guid.NewGuid();
}

public class Certification
{
    public Guid Id { get; private set; }
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;

    public Certification() => Id = Guid.NewGuid();
}

public class Project
{
    public Guid Id { get; private set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;

    public Project() => Id = Guid.NewGuid();
}

public class Skill
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public int Weight { get; private set; } = 1;

    private Skill() { }

    public Skill(string name, string category, int weight = 1)
    {
        Id = Guid.NewGuid();
        Name = name;
        Category = category;
        Weight = weight;
    }
}
