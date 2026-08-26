# Universidade Empresarial

Aplicação de aprendizagem corporativa para alfabetização funcional, matemática prática e competências do mundo do trabalho.

## Estado atual

- GitHub: `nutricionistaalmeidavh-spec/UniversidadeEmpresarial` (fonte versionada, branch `main`).
- AppDeploy: `fluxodre-campo-b2u-clbfo5` (runtime operacional).
- URL: https://fluxodre-campo-b2u-clbfo5.v2.appdeploy.ai/
- Snapshot operacional mais recente: `1787705073327`.
- 3 áreas visíveis, 12 competências, níveis N1–N5 e 60 unidades.
- 180 atividades-base e 429 variantes autorais; 609 itens auditados.

## Funcionalidades preservadas

- Sondagem adaptativa independente por competência, com nivelamento N1–N5.
- Fundamentos numéricos antes de Adição/Subtração; números romanos são complementares.
- Prática diária, seleção variável de questões e revisão espaçada em 1/3/7/14/30 dias.
- Progresso por unidade e competência.
- Questões objetivas e respostas curtas com correção automática.
- Respostas abertas com estado `pending_review` e fila de avaliação na Administração RH.
- RBAC para Superadmin, Admin, RH, Gestor e Colaborador.
- Acesso administrativo para revisão de todas as aulas, sem alterar o nivelamento individual.
- Imagens contextuais com texto alternativo nas questões exibidas.

## Organização do código

- `app/src/curriculum.ts`: competências, unidades, calibração, seleção variável e progressão.
- `app/src/*-bank.ts`: bancos adicionais de variantes.
- `app/src/university.ts`: interface, sondagem, aulas, tarefas, progresso e RH.
- `app/backend/education.ts`: autenticação educacional, diagnóstico, unidades, revisão humana e RBAC.
- `app/backend/unit-policy.ts`: regra server-side de consolidação 3/3.
- `app/tests/`: testes automatizados de regras, auditoria e consolidação.
- `docs/content-audit.md`: inventário e resultado da auditoria curricular.
- `training/legacy-lideranca/`: conteúdo histórico preservado; não faz parte da Universidade atual.

## Validação local

Dentro de `app/`:

```text
npm test
npm run build
```

O deploy só deve ser feito após os testes e o build passarem. Consulte `APPDEPLOY_SYNC.md` para o registro operacional.

As atividades são autorais e usam os materiais pedagógicos recebidos como referência, sem reprodução literal.
