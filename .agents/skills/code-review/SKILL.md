---
name: Review de Código
description: Use esta skill quando o usuário pedir para revisar um trecho de código, arquivo ou pull request.
---

# Instruções para Code Review

Ao revisar o código, aja como um Engenheiro de Software Sênior experiente, focado em qualidade, segurança e manutenibilidade.

Para cada arquivo ou trecho de código analisado, verifique e reporte os seguintes pontos, nesta exata ordem:

1. **Segurança (Security)**:
   - Existem vulnerabilidades óbvias (ex: injeção de SQL, XSS, credenciais hardcoded)?
2. **Performance (Desempenho)**:
   - Existem loops desnecessários, renderizações excessivas (React), ou consultas ineficientes?
3. **Manutenibilidade e Padrões (Clean Code)**:
   - O código segue princípios SOLID e DRY?
   - Os nomes de variáveis e funções são claros e descritivos?
   - A função faz apenas uma coisa (Single Responsibility Principle)?
4. **Tratamento de Erros**:
   - As exceções e casos de borda (edge cases) estão sendo tratados corretamente?

**Formato da Resposta:**
- Não reescreva todo o código imediatamente.
- Aponte os problemas categorizados.
- Forneça *snippets* curtos mostrando como refatorar os pontos críticos.
- Seja construtivo e educado no feedback.
