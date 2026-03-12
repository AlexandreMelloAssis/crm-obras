# PROJECT ROADMAP - CrmObras

## Visão do produto
Plataforma comercial de gestão de obras com foco em controle de custos, documentos, cronograma e financiamento de forma simples e didática.

## Módulos
- Autenticação e perfis
- Gestão de obras e etapas
- Materiais, fornecedores e cotações
- Custos e consolidação financeira
- Documentos e anexos
- Orçamentos e financiamento Caixa
- Dashboard e indicadores

## Backlog MVP
- Login e registro com JWT
- CRUD básico de obras
- Cadastro de etapas por obra
- Cadastro e listagem de materiais
- Lançamento de custos e resumo por obra
- Upload de documentos com categoria

## Backlog versão 1
- Gestão completa de orçamento (itens, aprovação)
- Cotações com fornecedores
- Fluxo de aprovação de documentos
- Alertas de estouro de custo
- Dashboard com gráficos

## Backlog futuro
- Aplicativo mobile (React Native/Flutter)
- Integração com storage cloud (S3/Azure Blob)
- Integração bancária e fluxo de caixa avançado
- Multiempresa e multiobra com permissões granulares

## Riscos técnicos
- Crescimento de anexos sem política de arquivamento
- Complexidade de regras financeiras conforme evolução
- Controle de concorrência em edições simultâneas

## Próximos passos
1. Implementar migrations iniciais do EF Core.
2. Adicionar testes de integração para endpoints críticos.
3. Evoluir frontend com formulários reais consumindo API.
4. Implementar observabilidade (tracing + métricas).
