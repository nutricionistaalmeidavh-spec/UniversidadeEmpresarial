# Sincronização com o AppDeploy

## Fonte e runtime

- GitHub (`nutricionistaalmeidavh-spec/UniversidadeEmpresarial`, `main`): fonte versionada do código.
- AppDeploy (`fluxodre-campo-b2u-clbfo5`): runtime operacional publicado.
- URL: https://fluxodre-campo-b2u-clbfo5.v2.appdeploy.ai/
- Snapshot operacional mais recente: `1787705245732`.

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
- `src/university.ts`.
- `backend/education.ts` e `backend/unit-policy.ts`.
- `tests/` e `docs/content-audit.md`.

## QA mínimo antes de publicar

Dentro de `app/`, executar:

```text
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

## Histórico

- Referência anterior: `1787699639513`.
- Auditoria completa dos bancos: `1787704289733`.
- Fundamentos numéricos: código `1787705002938`.
- Snapshot operacional atual: `1787705245732`.
