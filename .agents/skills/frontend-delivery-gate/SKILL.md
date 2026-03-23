---
name: frontend-delivery-gate
description: Checklist de implementacao e qualidade para frontend CRM Obras (Next.js + TypeScript + DayNight style).
version: 1.0.0
---

# Frontend Delivery Gate

Use esta skill ao implementar funcionalidades de frontend no CRM Obras.

## Objetivo

Garantir separacao entre UI, regra de negocio de tela, consumo de API e contexto de autenticacao/autorizacao.

## Fluxo obrigatorio

1. Ler contratos existentes no backend antes de consumir endpoint.
2. Criar/ajustar tipos em `frontend/src/features/*/types`.
3. Implementar chamadas em `frontend/src/features/*/services`.
4. Encapsular estado assíncrono em hooks de feature.
5. Usar componentes de `shared/components` para loading, erro e vazio.
6. Proteger tela com `ProtectedPage` e permissions quando aplicavel.
7. Validar com `npm run lint` e `npm run typecheck` antes de liberar.

## Regras de arquitetura

- Nao chamar `axios` direto na pagina.
- Nao misturar JSX com transformação complexa de dados.
- Nao renderizar acao sem permissão da obra ativa.
- Toda rota operacional deve depender de obra ativa quando exigido.

## Gate visual (DayNight)

- Usar tokens e classes de `daynight.css`.
- Manter contraste em light/dark.
- Preservar layout limpo, administrativo e responsivo.
