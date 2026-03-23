using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CrmObras.Domain.Entities;

namespace CrmObras.Infrastructure.Persistence.Configurations;

public class WorkConfiguration : IEntityTypeConfiguration<Work>
{
    public void Configure(EntityTypeBuilder<Work> builder)
    {
        builder.ToTable("work_projects");
        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(250).IsRequired();
        builder.HasMany(x => x.Stages).WithOne(x => x.Work).HasForeignKey(x => x.WorkId);
    }
}

