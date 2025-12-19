using AIResumeAnalyzer.Domain.Entities;

namespace AIResumeAnalyzer.Application.Common.Interfaces.Persistence;

public interface IJobDescriptionRepository
{
    Task<JobDescription?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(JobDescription jobDescription, CancellationToken cancellationToken = default);
}




