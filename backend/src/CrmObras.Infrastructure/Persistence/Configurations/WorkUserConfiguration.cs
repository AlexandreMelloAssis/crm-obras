using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CrmObras.Domain.Entities;

namespace CrmObras.Infrastructure.Persistence.Configurations;

public class WorkUserConfiguration : IEntityTypeConfiguration<WorkUser>
{
    public void Configure(EntityTypeBuilder<WorkUser> builder)
    {
        builder.ToTable("work_users");
        
        // O usuário só pode ter 1 vínculo por obra para não duplicarmos roles
        builder.HasIndex(x => new { x.WorkId, x.UserId }).IsUnique();

        builder.HasOne(x => x.Work).WithMany(x => x.WorkUsers).HasForeignKey(x => x.WorkId);
        builder.HasOne(x => x.User).WithMany(x => x.WorkUsers).HasForeignKey(x => x.UserId);
        builder.HasOne(x => x.Role).WithMany(x => x.WorkUsers).HasForeignKey(x => x.RoleId);
    }
}
