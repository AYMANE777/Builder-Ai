namespace AIResumeAnalyzer.Infrastructure.Nlp;

public interface ISkillDictionary
{
    IReadOnlyList<string> ExtractSkills(IReadOnlyList<string> tokens);
}

public class SkillDictionary : ISkillDictionary
{
    private readonly HashSet<string> _skills;

    public SkillDictionary()
    {
        _skills = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "c#","dotnet",".net","asp.net","aspnet","react","typescript","javascript",
            "sql","azure","aws","docker","kubernetes","ml.net","python","nlp","tensorflow",
            "git","jira","scrum","agile","node.js","angular","vue","mongodb","postgresql",
            "mysql","redis","elasticsearch","kafka","rabbitmq","microservices","rest","graphql"
        };
    }

    public IReadOnlyList<string> ExtractSkills(IReadOnlyList<string> tokens)
    {
        var found = tokens
            .Where(t => _skills.Contains(t))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return found;
    }
}




