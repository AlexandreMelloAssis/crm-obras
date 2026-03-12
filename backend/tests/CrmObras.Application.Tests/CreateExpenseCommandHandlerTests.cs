using FluentAssertions;
using CrmObras.Application.Features.Costs.Commands.CreateExpense;
using CrmObras.Application.Tests.Common;
using Xunit;

namespace CrmObras.Application.Tests;

public class CreateExpenseCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldPersistExpense_WhenValid()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateExpenseCommandHandler(db);

        var expenseId = await handler.HandleAsync(new CreateExpenseCommand(Guid.NewGuid(), 1, 1000m, "Mão de obra"));

        expenseId.Should().NotBe(Guid.Empty);
        db.Expenses.Should().ContainSingle();
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenAmountIsInvalid()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new CreateExpenseCommandHandler(db);

        var act = async () => await handler.HandleAsync(new CreateExpenseCommand(Guid.NewGuid(), 1, 0m, "inválido"));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
