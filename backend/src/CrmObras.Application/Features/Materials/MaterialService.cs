using Microsoft.EntityFrameworkCore;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DTOs;
using CrmObras.Domain.Entities;
using CrmObras.Domain.Enums;

namespace CrmObras.Application.Features.Materials;

public class MaterialService(IApplicationDbContext dbContext)
{
    public async Task<Guid> CreateAsync(CreateMaterialRequest request, CancellationToken cancellationToken = default)
    {
        var material = new Material
        {
            Name = request.Name,
            Unit = request.Unit,
            Category = (MaterialCategory)request.Category
        };

        dbContext.Materials.Add(material);
        await dbContext.SaveChangesAsync(cancellationToken);
        return material.Id;
    }

    public Task<List<MaterialDto>> ListAsync(CancellationToken cancellationToken = default) =>
        dbContext.Materials
            .Select(x => new MaterialDto(x.Id, x.Name, x.Unit, x.Category.ToString()))
            .ToListAsync(cancellationToken);
}
