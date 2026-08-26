# Task 5 — barreira de qualidade pedagógica

## Resultado

- Corrigida a regressão curada da rima: `O gato subiu no muro, e o rato ficou no escuro` é agora `short-text`, com gabarito e aceite `escuro`.
- Criado `app/src/content-guidance.ts`, que aplica dicas, critérios de revisão e comprimento mínimo a partir de metadados declarados de competência e tópico. Não há inferência linguística ampla.
- As três fábricas de variantes passam pela mesma orientação declarativa. Itens `text` têm `reviewCriteria`, `minLength` inteiro positivo e dica específica; fontes foram preservadas.
- Respostas de escolha com rótulos estruturais (`a`, `a)`, `a.`) são normalizadas para a opção publicada, incluindo os aceites.
- `selectQuestions()` continua determinístico por semente e, para aulas de três itens com ao menos duas opções objetivas disponíveis, limita a seleção a uma resposta aberta.
- A auditoria agora aplica condições reais por tipo: escolhas, respostas curtas, respostas abertas e fontes.

## Invariantes verificados

- 60 unidades, 180 itens-base e 429 variantes continuam disponíveis.
- A sondagem continua usando apenas o primeiro item-base de cada unidade em `CALIBRATION_BANK`; nenhum item aberto foi movido para ela.
- A lógica N1–N5 e a pontuação diagnóstica não foram modificadas.

## Evidência de TDD

Os testes de regressão estrutural e do item `muro` foram adicionados antes da implementação e falharam na linha de base: faltavam metadados de revisão, o item era `text` sem gabarito e a escolha estrutural ainda tinha aceites rotulados não resolvidos. Após a implementação, as mesmas verificações passaram.

## Verificações executadas

| Comando | Resultado |
| --- | --- |
| `cd app && npm test -- content-audit.test.ts` | passou: 10 testes |
| `cd app && npm test` | passou: 43 testes em 6 arquivos |
| `cd app && npm run build` | passou |
| `git diff --check` | passou |

## Limites e acompanhamento

O teste ainda emite os dois pares de similaridade lexical já existentes para revisão editorial, sem falhar a suíte. A auditoria deliberadamente não tenta detectar rimas em português de forma geral, avaliar tom adulto automaticamente ou substituir a avaliação humana de respostas abertas.

## Correção de calibração de comprimento

Após a revisão, os comprimentos mínimos deixaram de depender apenas da competência: uma tabela editorial declarada por enunciado preserva respostas unitárias justificadas em um caractere e exige entregas proporcionais para listas, separação de sílabas, formação de palavras e produção de frases. As regressões exercitam cinco enunciados multipartes reais e confirmam, via `evaluateLessonAnswer`, que `a` é inválido para cada um deles.
