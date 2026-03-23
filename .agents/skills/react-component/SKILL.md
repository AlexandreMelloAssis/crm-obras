---
name: Gerar Componente React
description: Use esta skill quando o usuário pedir para criar um novo componente React.
---

# Instruções para Criação de Componente React

Sempre que você for solicitado a criar um novo componente React, você deve seguir este padrão estrutural:

1. **Localização**: Pergunte onde o componente deve ser salvo ou deduza a partir do contexto (ex: `src/components/NomeDoComponente`).
2. **Arquivos a serem criados**:
   - `index.tsx` (ou `.jsx` se o projeto não usar TypeScript): O código principal do componente.
   - `styles.css` (ou `.module.css`, ou outro formato de estilo usado no projeto).
   - `NomeDoComponente.test.tsx`: O arquivo básico de testes (usando Jest/Testing Library ou Vitest).

3. **Padrão do Código (`index.tsx`)**:
   - Use Functional Components.
   - Defina uma interface para as `Props` (se estiver usando TypeScript).
   - Exporte o componente como `default`.

**Exemplo de Estrutura:**
```tsx
import React from 'react';
import './styles.css';

interface NomeDoComponenteProps {
  // defina as props aqui
}

export default function NomeDoComponente({}: NomeDoComponenteProps) {
  return (
    <div className="nome-do-componente-container">
      {/* conteúdo */}
    </div>
  );
}
```

**Regras**:
- Sempre verifique se o projeto utiliza TypeScript (`.tsx`) ou JavaScript (`.jsx`) antes de criar.
- Mantenha o componente focado em uma única responsabilidade.
