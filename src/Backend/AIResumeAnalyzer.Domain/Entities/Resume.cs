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
    public string Language { get; private set; } = "en";
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private readonly List<WorkExperience> _workExperiences = new();
    public IReadOnlyCollection<WorkExperience> WorkExperiences => _workExperiences.AsReadOnly();

    private readonly List<Education> _education = new();
    public IReadOnlyCollection<Education> Education => _education.AsReadOnly();

    private readonly List<Skill> _skills = new();
    [NotMapped]
    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();
    
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
