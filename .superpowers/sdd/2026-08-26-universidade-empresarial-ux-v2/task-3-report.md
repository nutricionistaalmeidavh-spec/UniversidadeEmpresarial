# Task 3 — Persistir e retomar a sondagem

## Entrega

- Adicionado contrato puro e estrito para rascunhos por participante: versão `1`, `skillIndex` `0..11`, `level` `1..5`, as 12 competências vigentes, respostas `level:N1` a `level:N5` e `updatedAt` ISO gerado no servidor.
- Incluídas rotas POST autenticadas para ler, salvar (upsert) e limpar o rascunho. A tabela é derivada exclusivamente do participante recuperado pela sessão; nenhum identificador do corpo da requisição é usado.
- A rota final do diagnóstico agora remove o rascunho somente depois de persistir o diagnóstico e atualizar o participante, mantendo a resposta de resultado existente.
- A Sondagem carrega o rascunho antes de renderizar o item, permite retry em falha de leitura, salva o próximo estado antes de avançar, oferece pausa persistida e mostra posição/percentual compreensíveis.

## Arquivos

- `app/backend/diagnostic-draft.ts`: validação, sanitização, criação com timestamp do servidor e regra pura de limpeza final.
- `app/backend/education.ts`: operações de armazenamento, três rotas de rascunho e limpeza pós-diagnóstico.
- `app/backend/index.ts`: registro aditivo das rotas novas.
- `app/src/diagnostic-flow.ts`: helpers de estado inicial, progresso, aplicação segura do rascunho e payload.
- `app/src/university.ts`: fluxo de UX de leitura, save-before-render, pausa e mensagens de recuperação.
- `app/tests/diagnostic-draft.test.ts`: 6 testes de contrato e helpers.

## TDD

O arquivo de testes foi criado antes dos módulos novos. A primeira execução focada falhou por não encontrar `backend/diagnostic-draft`; após a implementação mínima, a mesma suíte passou com 6 testes.

## Evidências

| Verificação | Resultado |
| --- | --- |
| `npm test -- diagnostic-draft.test.ts` | 1 arquivo, 6 testes aprovados |
| `npm test` | 5 arquivos, 29 testes aprovados |
| `npm run build` | build Vite aprovado |
| `git diff --check` | aprovado, sem erros de whitespace |
| Bundle/sintaxe do backend com esbuild + `node --check` | aprovado |

## Revisão e riscos

- A revisão confirmou que nenhum participante pode selecionar a tabela de outro participante: todas as rotas obtêm `p.id` a partir do token.
- Estado inválido, com versão incompatível, chave extra, valor inválido, índice ou nível fora da faixa é tratado como inválido e não é aplicado na retomada.
- Não houve alteração no cálculo N1–N5 nem no formato de resposta final.
- Não existe harness de integração para o SDK de banco neste repositório; as rotas foram verificadas por contrato, bundling/sintaxe e pelos helpers puros, mas não contra um banco real.
