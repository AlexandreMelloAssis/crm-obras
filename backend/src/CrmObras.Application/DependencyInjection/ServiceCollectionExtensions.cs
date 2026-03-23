using Microsoft.Extensions.DependencyInjection;
using CrmObras.Application.Features.Auth;
using CrmObras.Application.Features.Costs.Commands.CreateExpense;
using CrmObras.Application.Features.Costs.Queries.GetProjectCostSummary;
using CrmObras.Application.Features.Documents.Analysis;
using CrmObras.Application.Features.Documents.Commands.UploadDocument;
using CrmObras.Application.Features.Documents.Queries.AnalyzeDocument;
using CrmObras.Application.Features.Documents.Queries.ListDocumentCategories;
using CrmObras.Application.Features.Materials;
using CrmObras.Application.Features.Works.Commands.CreateWork;
using CrmObras.Application.Features.Works.Queries.ListWorks;
using CrmObras.Application.Features.Works.Queries.GetWork;
using CrmObras.Application.Features.Works.Commands.UpdateWork;
using CrmObras.Application.Features.Works.Commands.DeleteWork;
using CrmObras.Application.Features.Workstages;
using CrmObras.Application.Features.Users.Queries.ListUsers;
using CrmObras.Application.Features.Users.Queries.GetUser;
using CrmObras.Application.Features.Users.Commands.UpdateUser;
using CrmObras.Application.Features.Users.Commands.DeleteUser;
using CrmObras.Application.Features.Suppliers.Queries.GetSupplier;
using CrmObras.Application.Features.Suppliers.Queries.ListSuppliers;
using CrmObras.Application.Features.Suppliers.Commands.CreateSupplier;
using CrmObras.Application.Features.Suppliers.Commands.UpdateSupplier;
using CrmObras.Application.Features.Suppliers.Commands.DeleteSupplier;

namespace CrmObras.Application.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();

        services.AddScoped<CreateWorkCommandHandler>();
        services.AddScoped<ListWorksQueryHandler>();
        services.AddScoped<GetWorkQueryHandler>();
        services.AddScoped<UpdateWorkCommandHandler>();
        services.AddScoped<DeleteWorkCommandHandler>();

        services.AddScoped<ListUsersQueryHandler>();
        services.AddScoped<GetUserQueryHandler>();
        services.AddScoped<UpdateUserCommandHandler>();
        services.AddScoped<DeleteUserCommandHandler>();

        services.AddScoped<GetSupplierQueryHandler>();
        services.AddScoped<ListSuppliersQueryHandler>();
        services.AddScoped<CreateSupplierCommandHandler>();
        services.AddScoped<UpdateSupplierCommandHandler>();
        services.AddScoped<DeleteSupplierCommandHandler>();

        services.AddScoped<ProjectStageService>();
        services.AddScoped<MaterialService>();

        services.AddScoped<CreateExpenseCommandHandler>();
        services.AddScoped<GetProjectCostSummaryQueryHandler>();

        services.AddScoped<UploadDocumentCommandHandler>();
        services.AddScoped<ListDocumentCategoriesQueryHandler>();
        services.AddScoped<AnalyzeDocumentQueryHandler>();
        services.AddScoped<IDocumentAnalysisParser, FinancingDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, InvoiceDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, BudgetDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, ArchitecturalDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, ElectricalDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, HydraulicDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, GypsumDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, MarbleDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, PaintingDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, TechnicalBlueprintDocumentAnalysisParser>();
        services.AddScoped<IDocumentAnalysisParser, GenericDocumentAnalysisParser>();

        return services;
    }
}
