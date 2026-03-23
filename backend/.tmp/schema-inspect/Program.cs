using System.Runtime.Loader;
using Npgsql;

var apiBin = @"c:\Projetos\crm-obras\backend\src\CrmObras.Api\bin\Debug\net10.0";
foreach (var dependency in new[]
{
    "Microsoft.Extensions.Logging.Abstractions.dll",
    "System.Diagnostics.DiagnosticSource.dll",
    "System.Runtime.CompilerServices.Unsafe.dll",
    "Microsoft.Extensions.DependencyInjection.Abstractions.dll",
    "Microsoft.Extensions.Options.dll"
})
{
    var path = Path.Combine(apiBin, dependency);
    if (File.Exists(path))
    {
        AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
    }
}

var connectionString = "Host=localhost;Port=5432;Database=crm-obras;Username=postgres;Password=1234abc@";
var tables = new[] { "work_projects", "Suppliers", "Expenses", "Users", "Materials", "documents", "Budgets", "CaixaFinancings", "WorkStages", "__EFMigrationsHistory" };
await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();
const string sql = @"
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = any(@tables)
order by table_name, ordinal_position;";
await using var cmd = new NpgsqlCommand(sql, conn);
cmd.Parameters.AddWithValue("tables", tables);
await using var reader = await cmd.ExecuteReaderAsync();
string? current = null;
while (await reader.ReadAsync())
{
    var table = reader.GetString(0);
    var column = reader.GetString(1);
    if (!string.Equals(current, table, StringComparison.Ordinal))
    {
        current = table;
        Console.WriteLine($"[{table}]");
    }
    Console.WriteLine($" - {column}");
}
