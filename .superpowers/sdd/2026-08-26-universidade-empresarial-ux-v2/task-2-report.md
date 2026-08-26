# Task 2 — Administração RH confiável

## Resultado

O acesso a Administração RH agora sempre substitui a tela atual por um estado de carregamento, conteúdo de overview ou erro recuperável. A tela anterior não permanece visível enquanto a navegação administrativa está ativa.

## Implementação

- Extraído `app/backend/admin-overview.ts`, um helper puro usado pela rota `POST /api/edu/admin/overview`.
- O helper preserva a autorização exclusiva para `superadmin`, `admin` e `rh` e monta uma resposta estável com `participants`, `pendingReviews` e todas as métricas numéricas.
- A rota mantém as respostas 401 e 403 existentes e continua usando autorização no servidor como fonte de verdade.
- O dispatcher da interface aguarda o carregamento da tela RH, exibindo `Carregando Administração RH…` antes da chamada.
- Falhas exibem uma tela Administração RH segura, com mensagem específica para 401/403 e mensagem genérica para outras falhas, sem dados de resposta ou stack trace.
- O botão `Tentar novamente` repete o carregamento. A atualização após revisão também usa o mesmo fluxo protegido.

## Testes adicionados

`app/tests/admin-overview.test.ts` cobre:

- agregação de participantes, revisões pendentes e métricas para dados populados;
- formato vazio com arrays vazios e métricas zero quando não há participantes;
- autorização de `superadmin`, `admin` e `rh`, com bloqueio de outros papéis.

## Verificações executadas

- `npm test -- admin-overview.test.ts` — 3 testes aprovados.
- `npm test` — 23 testes aprovados em 4 arquivos.
- `npm run build` — build Vite concluído.
- `git diff --check` — sem erros de whitespace.

## Auto-revisão

- Confirmado que a rota de overview usa diretamente o helper puro testado.
- Confirmado que a chamada de overview ocorre somente através do fluxo com loading e tratamento de erro.
- Confirmado que ações existentes de revisão e gestão de papéis permanecem conectadas; a atualização após revisão recarrega via o fluxo seguro.
