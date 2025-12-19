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

    public ResumeController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Analyze a resume against a job description.
    /// </summary>
    [HttpPost("analyze")]
    [AllowAnonymous] // Temporarily allow anonymous for testing
    public async Task<ActionResult<AnalyzeResumeResult>> Analyze(
        [FromForm] AnalyzeResumeRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request.ResumeFile == null)
        {
            return BadRequest(new { error = "Resume file is required" });
        }

        try
        {
            var resumeText = await ResumeFileToTextAsync(request.ResumeFile, cancellationToken);

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
    public string JobTitle { get; set; } = string.Empty;
    public string JobDescriptionText { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Language { get; set; }
}

