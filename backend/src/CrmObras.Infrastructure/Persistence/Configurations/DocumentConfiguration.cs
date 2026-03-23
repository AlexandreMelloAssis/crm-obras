using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CrmObras.Domain.Entities;

namespace CrmObras.Infrastructure.Persistence.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("documents");
        builder.Property(x => x.FileName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.StoragePath).IsRequired().HasMaxLength(400);
        builder.HasOne(x => x.Work).WithMany().HasForeignKey(x => x.WorkId);
        builder.HasOne(x => x.DocumentCategory).WithMany().HasForeignKey(x => x.DocumentCategoryId);
    }
}

