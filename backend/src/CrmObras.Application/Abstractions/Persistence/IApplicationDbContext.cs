using Microsoft.EntityFrameworkCore;
using CrmObras.Domain.Entities;

namespace CrmObras.Application.Abstractions.Persistence;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<WorkProject> WorkProjects { get; }
    DbSet<WorkStage> WorkStages { get; }
    DbSet<Material> Materials { get; }
    DbSet<Expense> Expenses { get; }
    DbSet<Document> Documents { get; }
    DbSet<DocumentCategory> DocumentCategories { get; }
    DbSet<Budget> Budgets { get; }
    DbSet<CaixaFinancing> CaixaFinancings { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
