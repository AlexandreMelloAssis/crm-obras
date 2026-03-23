# Frontend Architecture (FASE 1)

## Estrutura base

- `app`: rotas e composicao de paginas.
- `features`: dominios da aplicacao (`auth`, `works`, `suppliers`, `costs`, `documents`, etc).
- `shared/components`: componentes reutilizaveis e estados padrao.
- `shared/config`: configuracoes transversais (ex.: navegacao).
- `services/api` e `lib`: cliente HTTP, query client, constantes.
- `providers`: providers globais (tema, auth, query, work, notificacoes).
- `types`: tipos compartilhados.
- `utils`: helpers puros.

## Pilares

1. **Autenticacao**: `AuthProvider`, token em localStorage + cookie para middleware.
2. **Obra ativa**: `WorkProvider` controla obras autorizadas e obra selecionada.
3. **Autorizacao visual**: `usePermissions`, `PermissionGate`, filtros de menu por permissao.
4. **Dados**: hooks de feature + React Query para cache e invalidação.
5. **UI consistente**: classes base DayNight e componentes compartilhados.
