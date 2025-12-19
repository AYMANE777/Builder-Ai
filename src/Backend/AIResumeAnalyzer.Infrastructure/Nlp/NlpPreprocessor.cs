using System.Text.RegularExpressions;

namespace AIResumeAnalyzer.Infrastructure.Nlp;

public interface INlpPreprocessor
{
    IReadOnlyList<string> Preprocess(string text, string language);
}

public class NlpPreprocessor : INlpPreprocessor
{
    private static readonly HashSet<string> EnStopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the","a","an","and","or","of","to","in","on","for","with","at","from","by","as","is","are","was","were"
    };

    private static readonly HashSet<string> FrStopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "le","la","les","un","une","et","ou","de","des","du","en","dans","pour","avec","par","est","sont","étais"
    };

    public IReadOnlyList<string> Preprocess(string text, string language)
    {
        if (string.IsNullOrWhiteSpace(text)) return Array.Empty<string>();

        text = text.ToLowerInvariant();
        text = Regex.Replace(text, @"[^\p{L}\p{N}\s]", " ");

        var tokens = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var stopWords = language.StartsWith("fr", StringComparison.OrdinalIgnoreCase)
            ? FrStopWords
            : EnStopWords;

        var normalized = tokens
            .Where(t => !stopWords.Contains(t))
            .Select(Lemmatize)
            .Where(t => t.Length > 1)
            .ToList();

        return normalized;
    }

    private static string Lemmatize(string token)
    {
        if (token.EndsWith("ing") && token.Length > 4)
            return token[..^3];
        if (token.EndsWith("ed") && token.Length > 3)
            return token[..^2];
        if (token.EndsWith("s") && token.Length > 3)
            return token[..^1];

        return token;
    }
}




