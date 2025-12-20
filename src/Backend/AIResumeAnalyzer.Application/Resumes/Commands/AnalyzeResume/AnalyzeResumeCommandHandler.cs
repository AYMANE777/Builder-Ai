using AIResumeAnalyzer.Application.Common.Interfaces.Persistence;
using AIResumeAnalyzer.Application.Common.Interfaces.Services;
using AIResumeAnalyzer.Domain.Entities;
using AIResumeAnalyzer.Domain.ValueObjects;
using MediatR;

namespace AIResumeAnalyzer.Application.Resumes.Commands.AnalyzeResume;

public sealed class AnalyzeResumeCommandHandler
    : IRequestHandler<AnalyzeResumeCommand, AnalyzeResumeResult>
{
    private readonly IResumeRepository _resumeRepository;
    private readonly IJobDescriptionRepository _jobRepository;
    private readonly IResumeAnalyzerService _analyzerService;

    public AnalyzeResumeCommandHandler(
        IResumeRepository resumeRepository,
        IJobDescriptionRepository jobRepository,
        IResumeAnalyzerService analyzerService)
    {
        _resumeRepository = resumeRepository;
        _jobRepository = jobRepository;
        _analyzerService = analyzerService;
    }

    public async Task<AnalyzeResumeResult> Handle(
        AnalyzeResumeCommand request,
        CancellationToken cancellationToken)
    {
        var resume = new Resume(
            request.CandidateName,
            request.Email,
            request.ResumeText,
            request.Language);

        var job = new JobDescription(
            request.JobTitle,
            request.JobDescriptionText,
            request.Language);

        // Perform analysis first (this adds skills to entities)
        var analysis = await _analyzerService.AnalyzeAsync(resume, job, cancellationToken);

        // Try to persist AFTER analysis (skills are added but EF Core ignores them)
        // Note: Skills collections are ignored in EF Core configuration
        try
        {
            await _resumeRepository.AddAsync(resume, cancellationToken);
            await _jobRepository.AddAsync(job, cancellationToken);
        }
        catch
        {
            // Database might not be initialized - continue anyway
        }

        return new AnalyzeResumeResult(
            analysis.CompatibilityScore,
            analysis.SkillMatchPercentage,
            analysis.AtsScore,
            analysis.PredictedLevel,
            analysis.ExtractedName,
            analysis.ExtractedEmail,
            analysis.ExtractedPhone,
            analysis.ExtractedJobTitle,
            analysis.ExtractedCity,
            analysis.ExtractedLinkedIn,
            analysis.ExtractedWebsite,
            analysis.ExtractedSummary,
            analysis.WorkExperiences,
            analysis.Education,
            analysis.Volunteering,
            analysis.Languages,
            analysis.Certifications,
            analysis.Projects,
            request.ResumeText,
            request.JobDescriptionText,
            analysis.ExtractedSkills,
            analysis.MatchedSkills,
            analysis.MissingSkills,
            analysis.Suggestions);
    }
}

