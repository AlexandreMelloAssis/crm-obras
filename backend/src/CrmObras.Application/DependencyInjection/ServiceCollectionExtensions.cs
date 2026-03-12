using Microsoft.Extensions.DependencyInjection;
using CrmObras.Application.Features.Auth;
using CrmObras.Application.Features.Costs.Commands.CreateExpense;
using CrmObras.Application.Features.Costs.Queries.GetProjectCostSummary;
using CrmObras.Application.Features.Documents.Commands.UploadDocument;
using CrmObras.Application.Features.Materials;
using CrmObras.Application.Features.Projects.Commands.CreateProject;
using CrmObras.Application.Features.Projects.Queries.ListProjects;
using CrmObras.Application.Features.ProjectStages;

namespace CrmObras.Application.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();

        services.AddScoped<CreateProjectCommandHandler>();
        services.AddScoped<ListProjectsQueryHandler>();

        services.AddScoped<ProjectStageService>();
        services.AddScoped<MaterialService>();

        services.AddScoped<CreateExpenseCommandHandler>();
        services.AddScoped<GetProjectCostSummaryQueryHandler>();

        services.AddScoped<UploadDocumentCommandHandler>();

        return services;
    }
}
