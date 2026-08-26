# Sincronização com o AppDeploy

## Fonte e runtime

- GitHub (`nutricionistaalmeidavh-spec/UniversidadeEmpresarial`, `main`): fonte versionada do código.
- AppDeploy (`fluxodre-campo-b2u-clbfo5`): runtime operacional publicado.
- URL: https://fluxodre-campo-b2u-clbfo5.v2.appdeploy.ai/
- Snapshot operacional mais recente: `1787767608561` (hardening v1).

O GitHub e o AppDeploy devem permanecer alinhados. Arquivos locais ficam em `app/`; durante o deploy, os arquivos são enviados para os caminhos equivalentes do snapshot remoto. `training/legacy-lideranca/` é histórico preservado e não deve ser apagado.

## Estrutura publicada

- 3 áreas de aprendizagem.
- 12 competências.
- Níveis N1–N5.
- 60 unidades (3 atividades selecionadas por unidade).
- 180 atividades-base + 429 variantes autorais.
- Sondagem adaptativa por competência.
- Tarefas diárias e revisão espaçada em 1/3/7/14/30 dias.
- Consolidação server-side somente com 3 questões objetivas e 3 acertos.
- Respostas abertas encaminhadas para `pending_review` e avaliadas pelo RH.
- RBAC: Superadmin, Admin, RH, Gestor e Colaborador.

## Arquivos principais sincronizados

- `src/curriculum.ts` e bancos de variantes.
- `src/university.ts` e `src/admin-rh-model.ts`.
- `backend/education.ts`, `backend/access-control.ts`, `backend/diagnostic-draft-store.ts` e `backend/unit-policy.ts`.
- `tests/`, `docs/content-audit.md` e documentação de hardening.

## QA mínimo antes de publicar

Dentro de `app/`, executar:

```text
npm run typecheck:critical
npm run test:critical
npm run test:content
npm test
npm run build
```

Depois do deploy, consultar o status até `ready` e conferir:

- erros de frontend, backend e rede vazios;
- login e troca de senha provisória;
- sondagem com níveis diferentes por competência;
- aula objetiva e resposta aberta;
- fila e decisão do RH;
- tarefa diária e revisão espaçada;
- bloqueio RBAC para Colaborador/Gestor;
- layout web e mobile.

## Integração contínua

O workflow `.github/workflows/university-ci.yml` roda instalação, typecheck crítico, regressões P0, auditoria curricular, suíte completa e build em push e pull request para `main`. A UX v2 confirmou que push direto para `main` é bloqueado; manter o job `Test and build` obrigatório no Ruleset.

## Histórico

- UX v2 publicada no AppDeploy: snapshot `1787763567892`, estado `ready`, sem erros de frontend, backend ou rede na verificação de 2026-08-26.
- UX v2 candidata à publicação: commit `7300435` (`codex/ux-v2`), tarefas 1–18.
- Escopo: primeiro acesso, retomada da sondagem, próxima ação, aula/feedback, progressão, navegação, painel RH, acessibilidade visual, motivação adulta e revisão editorial.
- Gate local em 2026-08-26: **66/66 testes** e build Vite aprovados; diff sem whitespace inválido, credenciais adicionadas ou arquivos fora do escopo.
- Rollback: republicar o commit `7a9f80d167d98165ddd84da6ef65352cdc6d37dd`; os novos campos persistidos são aditivos e podem permanecer sem afetar a versão anterior.

- Referência anterior: `1787699639513`.
- Auditoria completa dos bancos: `1787704289733`.
- Fundamentos numéricos: código `1787705002938`.
- Snapshot operacional atual: `1787763567892` (UX v2).
- Hardening/manutenção v1 publicada após merge no Git e CI verde: snapshot `1787767608561`, estado `ready`, sem erros de frontend, backend ou rede na verificação de 2026-08-26.
