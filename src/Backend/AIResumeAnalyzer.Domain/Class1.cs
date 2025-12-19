using System.ComponentModel.DataAnnotations.Schema;

namespace AIResumeAnalyzer.Domain.Entities;

public class Resume
{
    public Guid Id { get; private set; }
    public string CandidateName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string RawText { get; private set; } = string.Empty;
    public string Language { get; private set; } = "en";
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    // Skills are computed during analysis, not persisted
    // Using a method instead of a property to prevent EF Core from discovering it
    private readonly List<Skill> _skills = new();
    
    [NotMapped]
    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();
    
    // Helper method to get skills without exposing the collection to EF Core
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

