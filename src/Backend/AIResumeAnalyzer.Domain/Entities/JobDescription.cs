using System.ComponentModel.DataAnnotations.Schema;

namespace AIResumeAnalyzer.Domain.Entities;

public class JobDescription
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string DescriptionText { get; private set; } = string.Empty;
    public string Language { get; private set; } = "en";
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    // Skills are computed during analysis, not persisted
    // Using a method instead of a property to prevent EF Core from discovering it
    private readonly List<Skill> _requiredSkills = new();
    
    [NotMapped]
    public IReadOnlyCollection<Skill> RequiredSkills => _requiredSkills.AsReadOnly();

    private JobDescription() { }

    public JobDescription(string title, string descriptionText, string language)
    {
        Id = Guid.NewGuid();
        Title = title;
        DescriptionText = descriptionText;
        Language = language;
    }

    public void AddRequiredSkill(Skill skill) => _requiredSkills.Add(skill);
    
    // Helper method to get skills without exposing the collection to EF Core
    internal List<Skill> GetRequiredSkillsInternal() => _requiredSkills;
}

