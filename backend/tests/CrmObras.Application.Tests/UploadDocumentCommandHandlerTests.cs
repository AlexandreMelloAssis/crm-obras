using FluentAssertions;
using CrmObras.Application.Features.Documents.Commands.UploadDocument;
using CrmObras.Application.Tests.Common;
using Xunit;

namespace CrmObras.Application.Tests;

public class UploadDocumentCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldPersistDocumentMetadata()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new UploadDocumentCommandHandler(db, new FakeFileStorageService());

        await using var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        var documentId = await handler.HandleAsync(new UploadDocumentCommand(Guid.NewGuid(), Guid.NewGuid(), "nota.pdf", "application/pdf", stream));

        documentId.Should().NotBe(Guid.Empty);
        db.Documents.Should().ContainSingle(d => d.FileName == "nota.pdf" && d.StoragePath == "uploads/nota.pdf");
    }

    [Fact]
    public async Task HandleAsync_ShouldThrow_WhenCategoryIsMissing()
    {
        await using var db = TestDbContextFactory.Create();
        var handler = new UploadDocumentCommandHandler(db, new FakeFileStorageService());

        await using var stream = new MemoryStream(new byte[] { 1, 2, 3 });
        var act = async () => await handler.HandleAsync(new UploadDocumentCommand(Guid.NewGuid(), Guid.Empty, "doc.pdf", "application/pdf", stream));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
