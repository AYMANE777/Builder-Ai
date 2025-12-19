namespace AIResumeAnalyzer.Domain.ValueObjects;

public sealed record Suggestion(
    string Section,
    string OriginalText,
    string SuggestedText,
    string Reason);
