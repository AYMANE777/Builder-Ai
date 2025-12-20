using AIResumeAnalyzer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIResumeAnalyzer.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<JobDescription> JobDescriptions => Set<JobDescription>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure entities FIRST, before base.OnModelCreating
        // This prevents EF Core from auto-discovering navigations
        var resumeBuilder = modelBuilder.Entity<Resume>();
        resumeBuilder.Ignore(r => r.Skills);
        resumeBuilder.Ignore(r => r.WorkExperiences);
        resumeBuilder.Ignore(r => r.Education);
        resumeBuilder.HasKey(r => r.Id);
        resumeBuilder.Property(r => r.CandidateName).HasMaxLength(200).IsRequired();
        resumeBuilder.Property(r => r.Email).HasMaxLength(320);
        resumeBuilder.Property(r => r.Phone).HasMaxLength(50);
        resumeBuilder.Property(r => r.JobTitle).HasMaxLength(200);
        resumeBuilder.Property(r => r.City).HasMaxLength(100);
        resumeBuilder.Property(r => r.LinkedIn).HasMaxLength(500);
        resumeBuilder.Property(r => r.Website).HasMaxLength(500);
        resumeBuilder.Property(r => r.ProfilePhotoUrl).HasMaxLength(1000);
        resumeBuilder.Property(r => r.RawText).IsRequired();
        resumeBuilder.UsePropertyAccessMode(PropertyAccessMode.Property);

        var jobBuilder = modelBuilder.Entity<JobDescription>();
        jobBuilder.Ignore(j => j.RequiredSkills);
        jobBuilder.HasKey(j => j.Id);
        jobBuilder.Property(j => j.Title).HasMaxLength(200).IsRequired();
        jobBuilder.Property(j => j.DescriptionText).IsRequired();
        jobBuilder.UsePropertyAccessMode(PropertyAccessMode.Property);

        // Now call base - this will apply conventions but our Ignore() calls are already in place
        base.OnModelCreating(modelBuilder);
    }
}
