---
name: Criar Testes Unitários
description: Use esta skill quando o usuário pedir para escrever testes para uma função, componente ou arquivo.
---

# Instruções para Criação de Testes Unitários

O objetivo é garantir uma cobertura abrangente para a lógida de negócios ou UI.

Siga estas etapas e padrões:

1. **Entenda o Contexto**:
   - O que a função/componente recebe e o que ela deve retornar/renderizar?
   - Quais são as dependências que precisam ser "mockadas" (APIs, bancos de dados, hooks de roteamento)?

2. **Estrutura dos Testes (AAA - Arrange, Act, Assert)**:
   - Organize os testes blocos `describe` claros.
   - Use blocos `it` ou `test` com descrições objetivas. Ex: `it('should return 404 when user is not found')`.
   - Prepare os dados (Arrange), execute a ação (Act), e valide o resultado (Assert).

3. **Cenários a Cobrir**:
   - **Caminho Feliz (Happy Path)**: O fluxo principal onde tudo dá certo.
   - **Erros e Exceções**: Como a função se comporta com parâmetros inválidos ou falhas de rede?
   - **Limites (Edge Cases)**: Arrays vazios, strings nulas, valores máximos.

**Regras estritas:**
- Use a biblioteca de testes padrão do ecossistema que está sendo usado (ex: Jest/Testing Library para React, Vitest para Vue, PyTest para Python).
- Foque no comportamento, não nos detalhes de implementação interna.
