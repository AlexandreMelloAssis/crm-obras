using FluentAssertions;
using CrmObras.Application.DTOs;
using CrmObras.Application.Features.ProjectStages;
using CrmObras.Application.Tests.Common;
using Xunit;

namespace CrmObras.Application.Tests;

public class ProjectStageServiceTests
{
    [Fact]
    public async Task CreateAsync_ShouldPersistStage()
    {
        await using var db = TestDbContextFactory.Create();
        var service = new ProjectStageService(db);

        var id = await service.CreateAsync(new CreateStageRequest(Guid.NewGuid(), "Fundação", "Escavação e base"));

        id.Should().NotBe(Guid.Empty);
        db.WorkStages.Should().ContainSingle(x => x.Name == "Fundação");
    }
}
