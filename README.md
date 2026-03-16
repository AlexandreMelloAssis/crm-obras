# CrmObras - Sistema de Gestão de Obras

Monorepo com backend .NET 9 (Clean Architecture em monólito modular) e frontend Next.js + TypeScript.

## Estrutura
- `backend/` API REST e camadas Domain/Application/Infrastructure/API
- `frontend/` aplicação web
- `PROJECT_ROADMAP.md` backlog técnico inicial
- `ARCHITECTURE_GUIDELINES.md` diretrizes de SOLID + Clean Architecture

## Backend
### Pré-requisitos
- .NET SDK 9
- PostgreSQL (ou `docker compose up -d`)

### Rodando localmente
```bash
cp .env.example .env
cd backend
# restaurar pacotes
 dotnet restore CrmObras.sln
# restaurar ferramentas locais (.NET EF CLI)
 dotnet tool restore
# aplicar migrations
 dotnet tool run dotnet-ef database update -p src/CrmObras.Infrastructure -s src/CrmObras.Api
# executar API
 dotnet run --project src/CrmObras.Api
```
API disponível em `https://localhost:5001` (Swagger habilitado em dev).

### Observação sobre migrations
Se aparecer o erro `dotnet-ef não existe`, rode `dotnet tool restore` dentro de `backend/` e use `dotnet tool run dotnet-ef ...`.

Se preferir a instalação global, use:
```bash
dotnet tool install --global dotnet-ef
```

## Frontend
### Pré-requisitos
- Node.js 20+

### Rodando localmente
```bash
cd frontend
npm install
npm run dev
```
App disponível em `http://localhost:3000`.

## Endpoints iniciais
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/users/me`
- `GET|POST /api/v1/projects`
- `POST /api/v1/project-stages`
- `POST /api/v1/documents/upload`
- `GET|POST /api/v1/materials`
- `POST /api/v1/costs`
- `GET /api/v1/costs/{projectId}/summary`
- `GET /api/v1/budgets`
- `GET /api/v1/financing`

## Próximos passos recomendados
- Criar migrations e seed inicial de perfis e categorias de documento.
- Implementar CRUD completo para budgets, financing e suppliers.
- Evoluir o frontend para consumir os endpoints de forma completa.
