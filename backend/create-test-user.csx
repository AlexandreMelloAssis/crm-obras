#!/usr/bin/env dotnet-script
#r "nuget: BCrypt.Net-Next, 4.0.3"
#r "nuget: Npgsql, 8.0.0"

using System;
using Npgsql;
using BCrypt.Net;

// Configuration
const string connectionString = "Host=localhost;Port=5432;Database=crm-obras;Username=postgres;Password=1234abc@";
const string email = "admin@obra.com.br";
const string fullName = "Administrador";
const string password = "Test123!";

// Hash password
var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

Console.WriteLine("=== Creating Test User ===");
Console.WriteLine($"Email: {email}");
Console.WriteLine($"Password: {password}");
Console.WriteLine($"Password Hash: {passwordHash}");

try
{
    using (var connection = new NpgsqlConnection(connectionString))
    {
        connection.Open();
        Console.WriteLine("✓ Connected to PostgreSQL");

        using (var command = connection.CreateCommand())
        {
            command.CommandText = @"
                INSERT INTO ""Users"" (""Id"", ""Email"", ""FullName"", ""PasswordHash"", ""IsActive"", ""CreatedAt"", ""CreatedBy"")
                VALUES (@id, @email, @fullName, @passwordHash, true, NOW(), 'system')
                ON CONFLICT (""Email"") DO UPDATE SET ""PasswordHash"" = @passwordHash
                RETURNING ""Email"", ""FullName"", ""IsActive"";
            ";

            command.Parameters.AddWithValue("@id", Guid.NewGuid());
            command.Parameters.AddWithValue("@email", email);
            command.Parameters.AddWithValue("@fullName", fullName);
            command.Parameters.AddWithValue("@passwordHash", passwordHash);

            using (var reader = command.ExecuteReader())
            {
                if (reader.Read())
                {
                    Console.WriteLine("✓ User created/updated successfully");
                    Console.WriteLine($"  Email: {reader["Email"]}");
                    Console.WriteLine($"  Full Name: {reader["FullName"]}");
                    Console.WriteLine($"  Active: {reader["IsActive"]}");
                }
            }
        }

        connection.Close();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"✗ Error: {ex.Message}");
}
