# Universidade Empresarial — Hardening e manutenção v1

## Objetivo

Reduzir risco operacional após a UX v2 sem redesenhar a experiência já estabilizada. O trabalho centraliza autorização do backend, torna a persistência da sondagem testável por contrato, extrai regras puras do painel RH e fortalece os gates do CI.

## Restrições

- Preservar os contratos HTTP existentes e as mensagens de erro visíveis.
- Não alterar cálculo N1–N5, progressão, revisão espaçada ou conteúdo curricular.
- Não alterar o snapshot AppDeploy antes de a mudança entrar no Git e passar pelo CI.
- Manter `training/legacy-lideranca/` intacto.

## Arquitetura

### Controle de acesso

`app/backend/access-control.ts` passa a ser a fonte única para perfis educacionais, fallback legado por `jobRole`, acesso administrativo e política de alteração de perfis. `education.ts` continua responsável pelas rotas e respostas HTTP, mas deixa de duplicar matrizes de permissão.

### Persistência da sondagem

`app/backend/diagnostic-draft-store.ts` encapsula a convenção de tabela e as operações read/upsert/clear atrás de uma interface mínima. Em produção, `education.ts` adapta `@appdeploy/sdk/db`; nos testes, um armazenamento em memória prova `salvar → ler → atualizar → limpar` e isolamento por participante.

### Administração RH

`app/src/admin-rh-model.ts` concentra rótulos de perfis/grupos e mensagens seguras para 401/403/erro genérico. `university.ts` fica responsável pela composição e eventos de tela, reduzindo lógica de apresentação embutida.

### CI

O CI ganha três gates explícitos antes da suíte completa: typecheck dos módulos críticos sem dependências de AppDeploy, regressões críticas e auditoria curricular. A suíte completa e o build continuam obrigatórios.

## Compatibilidade

Nenhum schema persistido muda. Tabelas de rascunho mantêm o mesmo nome e o mesmo record. As rotas, payloads e estados `practice`, `consolidated`, `review` e `pending_review` permanecem iguais.
