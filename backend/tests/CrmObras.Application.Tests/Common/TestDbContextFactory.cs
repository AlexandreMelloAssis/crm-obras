using Microsoft.EntityFrameworkCore;

namespace CrmObras.Application.Tests.Common;

public static class TestDbContextFactory
{
    public static TestApplicationDbContext Create()
    {
        var options = new DbContextOptionsBuilder<TestApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new TestApplicationDbContext(options);
    }
}
