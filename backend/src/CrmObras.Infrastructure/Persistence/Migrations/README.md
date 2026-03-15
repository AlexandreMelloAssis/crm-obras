# Migrations

Executar geração de migration:

```bash
dotnet tool restore
dotnet tool run dotnet-ef migrations add InitialCreate -p src/CrmObras.Infrastructure -s src/CrmObras.Api -o Persistence/Migrations
```
