using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmObras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncSchemaForCurrentModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "work_projects" ADD COLUMN IF NOT EXISTS "Budget" numeric NOT NULL DEFAULT 0;
                ALTER TABLE "work_projects" ADD COLUMN IF NOT EXISTS "StartDate" timestamp with time zone NULL;
                ALTER TABLE "work_projects" ADD COLUMN IF NOT EXISTS "EndDate" timestamp with time zone NULL;
                ALTER TABLE "work_projects" ALTER COLUMN "Responsible" DROP NOT NULL;

                ALTER TABLE "Roles" ADD COLUMN IF NOT EXISTS "Description" text NOT NULL DEFAULT '';
                ALTER TABLE "Roles" ADD COLUMN IF NOT EXISTS "IsSystemDefault" boolean NOT NULL DEFAULT false;
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "IsActive" boolean NOT NULL DEFAULT true;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'WorkProjectId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'WorkId'
                    ) THEN
                        EXECUTE 'ALTER TABLE "Expenses" RENAME COLUMN "WorkProjectId" TO "WorkId"';
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'WorkProjectId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'WorkId'
                    ) THEN
                        EXECUTE 'ALTER TABLE "documents" RENAME COLUMN "WorkProjectId" TO "WorkId"';
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'WorkStages' AND column_name = 'WorkProjectId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'WorkStages' AND column_name = 'WorkId'
                    ) THEN
                        EXECUTE 'ALTER TABLE "WorkStages" RENAME COLUMN "WorkProjectId" TO "WorkId"';
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Budgets' AND column_name = 'WorkProjectId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Budgets' AND column_name = 'WorkId'
                    ) THEN
                        EXECUTE 'ALTER TABLE "Budgets" RENAME COLUMN "WorkProjectId" TO "WorkId"';
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'CaixaFinancings' AND column_name = 'WorkProjectId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'CaixaFinancings' AND column_name = 'WorkId'
                    ) THEN
                        EXECUTE 'ALTER TABLE "CaixaFinancings" RENAME COLUMN "WorkProjectId" TO "WorkId"';
                    END IF;
                END $$;

                CREATE TABLE IF NOT EXISTS "Suppliers" (
                    "Id" uuid NOT NULL,
                    "Name" text NOT NULL,
                    "Contact" text NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "CreatedBy" text NULL,
                    "UpdatedBy" text NULL,
                    CONSTRAINT "PK_Suppliers" PRIMARY KEY ("Id")
                );

                CREATE TABLE IF NOT EXISTS "permissions" (
                    "Id" uuid NOT NULL,
                    "SystemName" character varying(100) NOT NULL,
                    "Description" character varying(250) NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "CreatedBy" text NULL,
                    "UpdatedBy" text NULL,
                    CONSTRAINT "PK_permissions" PRIMARY KEY ("Id")
                );

                CREATE TABLE IF NOT EXISTS "work_users" (
                    "Id" uuid NOT NULL,
                    "WorkId" uuid NOT NULL,
                    "UserId" uuid NOT NULL,
                    "RoleId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "CreatedBy" text NULL,
                    "UpdatedBy" text NULL,
                    CONSTRAINT "PK_work_users" PRIMARY KEY ("Id"),
                    CONSTRAINT "FK_work_users_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE,
                    CONSTRAINT "FK_work_users_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
                    CONSTRAINT "FK_work_users_work_projects_WorkId" FOREIGN KEY ("WorkId") REFERENCES "work_projects" ("Id") ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS "role_permissions" (
                    "Id" uuid NOT NULL,
                    "RoleId" uuid NOT NULL,
                    "PermissionId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "CreatedBy" text NULL,
                    "UpdatedBy" text NULL,
                    CONSTRAINT "PK_role_permissions" PRIMARY KEY ("Id"),
                    CONSTRAINT "FK_role_permissions_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE,
                    CONSTRAINT "FK_role_permissions_permissions_PermissionId" FOREIGN KEY ("PermissionId") REFERENCES "permissions" ("Id") ON DELETE CASCADE
                );

                CREATE UNIQUE INDEX IF NOT EXISTS "IX_permissions_SystemName" ON "permissions" ("SystemName");
                CREATE INDEX IF NOT EXISTS "IX_role_permissions_PermissionId" ON "role_permissions" ("PermissionId");
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_role_permissions_RoleId_PermissionId" ON "role_permissions" ("RoleId", "PermissionId");
                CREATE INDEX IF NOT EXISTS "IX_work_users_RoleId" ON "work_users" ("RoleId");
                CREATE INDEX IF NOT EXISTS "IX_work_users_UserId" ON "work_users" ("UserId");
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_work_users_WorkId_UserId" ON "work_users" ("WorkId", "UserId");
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP TABLE IF EXISTS "role_permissions";
                DROP TABLE IF EXISTS "work_users";
                DROP TABLE IF EXISTS "permissions";
                DROP TABLE IF EXISTS "Suppliers";
                """
            );
        }
    }
}
