using AIResumeAnalyzer.Application.Common.Interfaces.Persistence;
using AIResumeAnalyzer.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIResumeAnalyzer.Infrastructure.Persistence.Repositories;

public class ResumeRepository : IResumeRepository
{
    private readonly AppDbContext _db;

    public ResumeRepository(AppDbContext db) => _db = db;

    public Task<Resume?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.Resumes.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public async Task AddAsync(Resume resume, CancellationToken cancellationToken = default)
    {
        await _db.Resumes.AddAsync(resume, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

