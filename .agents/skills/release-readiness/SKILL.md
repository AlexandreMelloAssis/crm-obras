---
name: release-readiness
description: Procedimento de validacao antes de subir frontend/backend local para homologacao.
version: 1.0.0
---

# Release Readiness

## Objetivo

Padronizar verificacoes antes de liberar ambiente local para testes.

## Checklist obrigatorio

1. Frontend:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build` (quando houver mudancas estruturais)
2. Backend:
   - `dotnet test`
3. Integracao:
   - Login funcional
   - Selecao de obra ativa
   - Acesso de menu respeitando permissao
4. Execucao local:
   - Backend em execucao
   - Frontend em execucao
   - Rotas principais acessiveis

## Critério de falha

Se qualquer etapa falhar, nao liberar. Corrigir e repetir o ciclo.
