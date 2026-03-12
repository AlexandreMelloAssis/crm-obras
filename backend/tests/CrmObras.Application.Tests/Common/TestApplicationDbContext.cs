using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Domain.Entities;

namespace CrmObras.Application.Tests.Common;

public class TestApplicationDbContext(DbContextOptions<TestApplicationDbContext> options) : DbContext(options), IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<WorkProject> WorkProjects => Set<WorkProject>();
    public DbSet<WorkStage> WorkStages => Set<WorkStage>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentCategory> DocumentCategories => Set<DocumentCategory>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<CaixaFinancing> CaixaFinancings => Set<CaixaFinancing>();
}
