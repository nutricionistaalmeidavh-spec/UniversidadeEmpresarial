# Task 4 — Respostas abertas e estado de revisão

## Escopo entregue

- `text` passou a ser resposta aberta: o cliente aceita conteúdo não vazio, aplica `minLength` somente quando configurado e não contabiliza a resposta como acerto ou erro.
- `choice` e `short-text` preservam a normalização objetiva anterior, incluindo `accept`.
- O tipo curricular recebeu metadados opcionais e aditivos: `minLength` e `reviewCriteria`. Nenhum conteúdo existente foi migrado.
- O servidor normaliza respostas abertas antes de decidir o estado: remove respostas vazias após `trim`, limita a dez respostas, mil caracteres de pergunta e quatro mil de resposta, e define `hasOpenAnswer` exclusivamente a partir do resultado normalizado.
- Respostas abertas válidas permanecem em `pending_review`; a unidade não entra em `completedUnits` antes da aprovação de RH. A fila e o fluxo de aprovação existentes foram preservados.
- A unidade agora atualiza o participante em memória a partir de `completedUnits` e `unitProgress` retornados e exibe uma página persistente de resultado, sem recarregar `mount()` imediatamente. Ela oferece `Próxima atividade` para Tarefas e `Voltar à jornada` para Home.
- Tarefas e Meu desenvolvimento exibem `pending_review` como `Aguardando correção`, inclusive nas legendas de estado.

## TDD e testes adicionados

O teste novo foi criado antes dos módulos de produção. A primeira execução falhou porque `open-response-policy` ainda não existia; após a implementação, o teste focado passou.

`app/tests/open-response.test.ts` cobre:

- respostas objetivas normalizadas para `choice` e `short-text`;
- resposta `text` aberta sem veredito automático;
- resposta aberta padrão não vazia e `minLength` opcional;
- normalização, descarte de vazios e limites no servidor;
- modelos de feedback para `correct`, `incorrect`, `practice`, `pending_review` e `completed`.

## Rastreabilidade de requisitos

| Requisito | Evidência |
| --- | --- |
| Resposta aberta não é autoavaliada | `evaluateLessonAnswer` devolve `correct: null` para `text`; a UI só incrementa erro quando `correct === false`. |
| Mínimo opcional | `EduItem.minLength?` e validação limitada ao item aberto. |
| Limites e confiança no servidor | `normalizeOpenResponses` e `hasOpenAnswer=openResponses.length>0` em `education.ts`. |
| Estado pendente persistente | Caminho existente de `pending_review` é mantido e não adiciona a unidade a `completedUnits`. |
| Resultado persistente e ações | `lessonFeedbackViewModel`, atualização de `me.participant` e botões de navegação em `university.ts`. |
| Estado explícito nas visões | Mapeamento e legendas de Tarefas e Meu desenvolvimento. |

## Verificações

- `npm test -- open-response.test.ts` — 9 testes aprovados.
- `npm test` — 38 testes aprovados em 6 arquivos. A auditoria curricular emite os dois avisos preexistentes de similaridade lexical, mas passa.
- `npm run build` — build Vite concluído.
- `git diff --check` — sem problemas de whitespace.

## Revisão e riscos residuais

- A mudança mantém a regra objetiva de consolidação no servidor e não altera a aprovação RH.
- Como a unidade é salva por uma API real do ambiente, a renderização ponta a ponta foi verificada por build e pelos contratos puros; não houve sessão de navegador autenticada disponível para um teste de fluxo completo.
- `app/src/university.ts` é monolítico, então o diff do Git representa a linha inteira apesar das edições localizadas. A comparação estrita com `6fa2f61` confirmou que os trechos alterados pertencem a este task.

## Fix round 1/5 — impedir substituição de pendência RH

- A abertura de uma unidade com `unitProgress[id].status === 'pending_review'` agora interrompe o fluxo antes de renderizar o formulário. Ela mostra `Aguardando correção` em modo somente-leitura, com `Próxima atividade` e `Voltar à jornada`.
- `POST /api/edu/unit` agora devolve HTTP 409 antes de calcular ou gravar progresso quando há, para a mesma unidade, status `pending_review` e uma pendência ativa na fila. A defesa exige as duas condições para não bloquear registros inconsistentes indevidamente.
- Depois de `needs_revision`, RH grava o estado `practice` e remove a pendência; por isso a mesma regra permite o novo envio.
- Os testes de regressão cobrem o bloqueio da tela, a detecção da pendência para a mesma unidade e a permissão de reenvio no estado `practice`.
