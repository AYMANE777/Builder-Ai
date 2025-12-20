using AIResumeAnalyzer.Application.Resumes.Commands.AnalyzeResume;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIResumeAnalyzer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumeController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IResumeParserService _parserService;

    public ResumeController(IMediator mediator, IResumeParserService parserService)
    {
        _mediator = mediator;
        _parserService = parserService;
    }

    /// <summary>
    /// Analyze a resume against a job description.
    /// </summary>
    [HttpPost("analyze")]
    [AllowAnonymous] // Temporarily allow anonymous for testing
    public async Task<ActionResult<AnalyzeResumeResult>> Analyze(
        [FromForm] AnalyzeResumeRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            string resumeText;
            if (request.ResumeFile != null)
            {
                using var stream = request.ResumeFile.OpenReadStream();
                resumeText = await _parserService.ParseAsync(stream, request.ResumeFile.FileName, cancellationToken);
            }
            else if (!string.IsNullOrEmpty(request.ResumeText))
            {
                resumeText = request.ResumeText;
            }
            else
            {
                return BadRequest(new { error = "Resume file or text is required" });
            }

            var command = new AnalyzeResumeCommand(
                request.CandidateName,
                request.Email,
                request.JobTitle,
                request.JobDescriptionText,
                resumeText,
                request.Language ?? "en");

            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    /// <summary>
    /// Train or retrain ML model.
    /// </summary>
    [HttpPost("train")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> Train(CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return Accepted(new { status = "Training started" });
    }

    private async Task<string> ResumeFileToTextAsync(IFormFile file, CancellationToken cancellationToken)
    {
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms, cancellationToken);
        var bytes = ms.ToArray();
        
        // Simple text extraction - in production, use proper PDF/DOCX parsers
        if (file.FileName.EndsWith(".txt", StringComparison.OrdinalIgnoreCase))
        {
            return System.Text.Encoding.UTF8.GetString(bytes);
        }
        
        // For PDF/DOCX, return a placeholder or implement proper parsing
        return $"Resume content from {file.FileName} - {bytes.Length} bytes";
    }
}

public sealed class AnalyzeResumeRequestDto
{
    public IFormFile? ResumeFile { get; set; }
    public string? ResumeText { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string JobDescriptionText { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Language { get; set; }
}

