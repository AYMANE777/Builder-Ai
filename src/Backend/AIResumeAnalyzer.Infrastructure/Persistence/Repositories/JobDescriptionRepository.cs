using AIResumeAnalyzer.Application.Common.Interfaces.Persistence;
using AIResumeAnalyzer.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIResumeAnalyzer.Infrastructure.Persistence.Repositories;

public class JobDescriptionRepository : IJobDescriptionRepository
{
    private readonly AppDbContext _db;

    public JobDescriptionRepository(AppDbContext db) => _db = db;

    public Task<JobDescription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.JobDescriptions.FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

    public async Task AddAsync(JobDescription jobDescription, CancellationToken cancellationToken = default)
    {
        await _db.JobDescriptions.AddAsync(jobDescription, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

