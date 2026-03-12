# Arquitetura e Boas Práticas (SOLID + Clean Architecture)

## Diretrizes obrigatórias
- **Domain**: contém apenas regras de negócio, entidades e enums (sem dependências de infraestrutura).
- **Application**: orquestra casos de uso por abstrações (`interfaces`), sem depender de implementações concretas.
- **Infrastructure**: implementa contratos da Application (persistência, JWT, hashing, storage).
- **API**: camada de entrada/saída (controllers, validação de borda, autenticação/autorização, serialização).

## Regras de qualidade
- Não expor entidades de domínio diretamente na API; sempre usar DTOs.
- Dependências sempre apontam para dentro (API -> Application -> Domain).
- Serviços de Application usam abstrações para recursos externos (ex.: hash de senha, storage, banco).
- Manter coesão alta e classes pequenas com responsabilidade única.

## Evolução recomendada
- Adicionar validação por FluentValidation nos comandos/requests.
- Introduzir testes de integração para fluxos críticos (Auth, Projects, Documents upload).
- Criar políticas de autorização por perfil (Admin/Manager/Engineer/Viewer).
