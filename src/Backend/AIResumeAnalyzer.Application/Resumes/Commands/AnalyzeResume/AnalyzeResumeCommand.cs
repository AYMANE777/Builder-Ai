using MediatR;

namespace AIResumeAnalyzer.Application.Resumes.Commands.AnalyzeResume;

public sealed record AnalyzeResumeCommand(
    string CandidateName,
    string Email,
    string JobTitle,
    string JobDescriptionText,
    string ResumeText,
    string Language) : IRequest<AnalyzeResumeResult>;




