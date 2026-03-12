using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CrmObras.Domain.Entities;

namespace CrmObras.Infrastructure.Persistence.Configurations;

public class WorkProjectConfiguration : IEntityTypeConfiguration<WorkProject>
{
    public void Configure(EntityTypeBuilder<WorkProject> builder)
    {
        builder.ToTable("work_projects");
        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Responsible).HasMaxLength(120).IsRequired();
        builder.HasMany(x => x.Stages).WithOne(x => x.WorkProject).HasForeignKey(x => x.WorkProjectId);
    }
}
