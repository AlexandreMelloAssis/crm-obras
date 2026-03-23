using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CrmObras.Domain.Entities;

namespace CrmObras.Infrastructure.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");
        builder.Property(x => x.SystemName).HasMaxLength(100).IsRequired();
        builder.HasIndex(x => x.SystemName).IsUnique();
        
        builder.Property(x => x.Description).HasMaxLength(250);
    }
}
