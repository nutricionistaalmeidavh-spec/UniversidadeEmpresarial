# Hardening e manutenção v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fortalecer persistência, autorização, modularização do RH e CI sem mudar o comportamento pedagógico da UX v2.

**Architecture:** Extrair regras puras para módulos pequenos, adaptar o SDK somente na borda de `education.ts` e manter a UI como orquestradora. Novos testes cobrem as fronteiras extraídas e o CI passa a falhar cedo em regressões P0.

**Tech Stack:** TypeScript, Vite 6, Vitest 2, AppDeploy SDK, GitHub Actions/Node 20.

**Spec:** `docs/superpowers/specs/2026-08-26-hardening-maintenance-design.md`

## Global Constraints

- Preservar contratos HTTP e mensagens de erro existentes.
- Não alterar cálculo N1–N5, conteúdo curricular ou revisão espaçada.
- Git continua fonte de verdade; AppDeploy só deve ser atualizado depois do CI verde.

---

### Task 1: Centralizar RBAC do backend

**Files:**
- Create: `app/backend/access-control.ts`
- Modify: `app/backend/education.ts`
- Test: `app/tests/access-control.test.ts`

- [ ] Escrever testes para perfis válidos, fallback legado, acesso administrativo, limites de Admin e autoproteção do Superadmin.
- [ ] Implementar helpers puros e substituir matrizes/condições duplicadas em `education.ts`.
- [ ] Rodar `npm test -- tests/access-control.test.ts`.

### Task 2: Tornar persistência da sondagem testável

**Files:**
- Create: `app/backend/diagnostic-draft-store.ts`
- Modify: `app/backend/education.ts`
- Modify: `app/backend/diagnostic-draft.ts`
- Test: `app/tests/diagnostic-draft-store.test.ts`

- [ ] Criar teste em memória para salvar, ler, atualizar, isolar participante e limpar.
- [ ] Extrair read/upsert/clear e adaptar `db` na borda.
- [ ] Adicionar narrowing numérico explícito em `diagnostic-draft.ts`.
- [ ] Rodar testes de rascunho existentes e novos.

### Task 3: Extrair modelo puro do RH

**Files:**
- Create: `app/src/admin-rh-model.ts`
- Modify: `app/src/university.ts`
- Test: `app/tests/admin-rh-model.test.ts`

- [ ] Testar rótulos e mensagens seguras de falha.
- [ ] Substituir mapas e parsing de erro embutidos no monólito.
- [ ] Rodar o teste focado e a suíte completa.

### Task 4: Fortalecer CI e documentação

**Files:**
- Modify: `app/package.json`
- Modify: `.github/workflows/university-ci.yml`
- Modify: `README.md`
- Modify: `APPDEPLOY_SYNC.md`

- [ ] Adicionar scripts `typecheck:critical`, `test:critical` e `test:content`.
- [ ] Executar esses gates antes de `npm test` e `npm run build` no workflow.
- [ ] Corrigir snapshot e texto de proteção da `main`.
- [ ] Rodar validação final e publicar via PR.
