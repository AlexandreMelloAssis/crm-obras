using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using CrmObras.Application.Abstractions.Auth;
using CrmObras.Application.Abstractions.Documents;
using CrmObras.Application.Abstractions.Persistence;
using CrmObras.Application.Abstractions.Storage;
using CrmObras.Infrastructure.Auth;
using CrmObras.Infrastructure.Documents;
using CrmObras.Infrastructure.Persistence;
using CrmObras.Infrastructure.Storage;

namespace CrmObras.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.Configure<DocumentIntelligenceOptions>(configuration.GetSection(DocumentIntelligenceOptions.SectionName));
        services.Configure<TesseractOcrOptions>(configuration.GetSection(TesseractOcrOptions.SectionName));
        services.AddHttpClient<HttpDocumentTextExtractionService>((provider, client) =>
        {
            var options = provider.GetRequiredService<Microsoft.Extensions.Options.IOptions<DocumentIntelligenceOptions>>().Value;
            client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds > 0 ? options.TimeoutSeconds : 60);
        });
        services.AddScoped<TesseractTextExtractionService>();
        services.AddScoped<WindowsImageOcrTextExtractionService>();
        services.AddScoped<IDocumentTextExtractionService, CompositeDocumentTextExtractionService>();

        var key = configuration["Jwt:Key"] ?? "development-super-secret-key-change-me";
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                };
            });

        return services;
    }
}
