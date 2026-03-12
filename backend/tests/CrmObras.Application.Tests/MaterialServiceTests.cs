using FluentAssertions;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.Materials;
using CrmObras.Application.Tests.Common;
using CrmObras.Domain.Enums;
using Xunit;

namespace CrmObras.Application.Tests;

public class MaterialServiceTests
{
    [Fact]
    public async Task CreateAndList_ShouldReturnMaterialDtos()
    {
        await using var db = TestDbContextFactory.Create();
        var service = new MaterialService(db);

        await service.CreateAsync(new CreateMaterialRequest("Cimento", "saco", (int)MaterialCategory.Structural));
        var items = await service.ListAsync();

        items.Should().ContainSingle(x => x.Name == "Cimento" && x.Category == "Structural");
    }
}
