using AIResumeAnalyzer.Application.Common.Interfaces.Persistence;
using AIResumeAnalyzer.Application.Common.Interfaces.Services;
using AIResumeAnalyzer.Infrastructure.ML;
using AIResumeAnalyzer.Infrastructure.Nlp;
using AIResumeAnalyzer.Infrastructure.Persistence;
using AIResumeAnalyzer.Infrastructure.Persistence.Repositories;
using AIResumeAnalyzer.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AIResumeAnalyzer.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IResumeRepository, ResumeRepository>();
        services.AddScoped<IJobDescriptionRepository, JobDescriptionRepository>();
        services.AddScoped<IResumeAnalyzerService, ResumeAnalyzerService>();
        services.AddSingleton<INlpPreprocessor, NlpPreprocessor>();
        services.AddSingleton<ISkillDictionary, SkillDictionary>();
        services.AddSingleton<IMLModelService, MLModelService>();

        return services;
    }
}


