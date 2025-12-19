using AIResumeAnalyzer.Domain.Entities;

namespace AIResumeAnalyzer.Application.Common.Interfaces.Persistence;

public interface IResumeRepository
{
    Task<Resume?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Resume resume, CancellationToken cancellationToken = default);
}




