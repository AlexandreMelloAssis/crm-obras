using CrmObras.Api.Extensions;
using CrmObras.Application.Abstractions.Auth;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.DependencyInjection;
using CrmObras.Domain.Entities;
using CrmObras.Infrastructure.DependencyInjection;
using CrmObras.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.AddDebug();

    var dataProtectionDirectory = new DirectoryInfo(
        Path.Combine(builder.Environment.ContentRootPath, ".data-protection"));

    builder.Services.AddDataProtection()
        .SetApplicationName("CrmObras")
        .PersistKeysToFileSystem(dataProtectionDirectory);
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (allow the frontend running on localhost:3000 to call the API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Auth configurations
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationPolicyProvider, CrmObras.Api.Authorization.WorkPermissionPolicyProvider>();
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, CrmObras.Api.Authorization.WorkPermissionHandler>();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});
builder.Services.AddVersionedApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});
builder.Services.AddHealthChecks().AddDbContextCheck<ApplicationDbContext>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DocumentCategorySeed.EnsureSeededAsync(dbContext);
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseGlobalExceptionHandling();
app.UseHttpsRedirection();

// Enable CORS so the frontend can call this API from localhost:3000
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Development endpoint to create test user
if (app.Environment.IsDevelopment())
{
    app.MapGet("/dev/create-test-user", async (IServiceProvider serviceProvider) =>
    {
        try
        {
            using (var scope = serviceProvider.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

                var testUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@obra.com.br");
                if (testUser != null)
                {
                    return Results.Ok(new { message = "Test user already exists", email = testUser.Email });
                }

                var newUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "admin@obra.com.br",
                    FullName = "Administrador de Testes",
                    PasswordHash = passwordHasher.Hash("Test123!"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };

                db.Users.Add(newUser);
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = "Test user created successfully",
                    email = newUser.Email,
                    password = "Test123!",
                    fullName = newUser.FullName
                });
            }
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }).WithName("CreateTestUser");
}

app.Run();
