# Auditoria do banco de questões

Auditoria automatizada do currículo da Universidade Empresarial. O código versionado no GitHub é a fonte de verdade; o AppDeploy é o runtime operacional e recebe os mesmos arquivos após a validação.

## Cobertura atual

- 12 competências, 5 níveis (N1–N5) e 60 unidades.
- 180 itens-base (3 atividades por unidade).
- 429 variantes: 131 em `additional-bank`, 98 em `portuguese-bank` e 200 em `young-adult-bank`.
- 609 itens auditados no total (base + variantes).
- Cada unidade continua selecionando exatamente 3 questões; a seleção mistura base e variantes compatíveis com competência e nível.

## Regras verificadas automaticamente

O teste `app/tests/content-audit.test.ts` verifica todos os bancos, não apenas os 180 itens-base:

- enunciado e dica não vazios;
- competência válida e nível N1–N5 compatível com a unidade;
- tipo válido (`choice`, `short-text` ou `text`);
- alternativas e gabarito coerentes;
- respostas curtas com resposta esperada;
- cada resposta aberta com critério de revisão, comprimento mínimo positivo e orientação declarada por competência e tópico;
- alternativas com ao menos duas opções distintas e gabarito/aceites normalizados para uma opção publicada;
- respostas curtas com gabarito ou aceite não vazio;
- fonte não vazia para toda variante;
- imagem opcional; quando existir, deve ter fonte e texto alternativo;
- ausência do antigo SVG genérico, que decorava a tela sem ajudar a resolver a atividade;
- ausência de expressões infantilizantes e limite de 55 palavras por enunciado;
- ausência de duplicidade exata após normalização;
- similaridade lexical Jaccard ≥ 0,75 reportada para revisão, sem apagar automaticamente o conteúdo;
- limite de três questões selecionadas por unidade e, quando houver ao menos duas questões objetivas disponíveis, no máximo uma resposta aberta em uma aula de três itens;
- regressão curada da rima “muro/escuro”, mantida como resposta curta objetiva e gabaritada.

Na última execução não houve duplicidade exata. Foram sinalizados dois pares lexicalmente próximos para revisão editorial futura; eles não são cópias literais e mantêm objetivos distintos.

## Portas de qualidade e limites

As dicas e os critérios de revisão das respostas abertas são gerados a partir de metadados declarados de competência e tópico, nunca de inferência automática sobre o texto do enunciado. Assim, itens de leitura, compreensão e escrita não recebem orientação de cálculo; itens numéricos recebem orientação compatível com dados, resultado ou estratégia. O comprimento mínimo usa uma base declarada por competência e exceções editoriais exatas por enunciado para respostas unitárias e tarefas multipartes.

As portas estruturais verificam forma e gabarito, mas não substituem revisão pedagógica humana. Elas usam regressões exatas para itens conhecidos, como “muro/escuro”, e não tentam detectar rimas em português, avaliar automaticamente o tom adulto ou julgar a qualidade semântica geral de uma resposta aberta. A fila de RH continua responsável pela avaliação das respostas abertas; a sondagem usa somente os itens-base calibrados, objetivos e gabaritados.

## Contexto visual e linguagem adulta

O inventário encontrou um SVG automático em todos os 609 itens. Ele repetia competência, nível e número da atividade, sem informação necessária à resposta. Esses visuais foram removidos; a interface agora renderiza imagem somente quando o item trouxer um recurso instrucional curado. Os enunciados preservam atividades fundamentais de alfabetização e matemática, mas passam por testes contra condescendência e excesso de extensão. Contextos de trabalho e vida cotidiana continuam prioritários nos bancos de jovens e adultos.

## Acessibilidade — verificação desta release

Foram verificados por código e build: landmarks, rótulos de formulário, mensagens com `aria-live`, foco programático no feedback, foco visível, alvos de toque de 44 px, alternativas inteiras selecionáveis e fonte de formulário de 16 px no celular. A aula foi organizada em uma coluna e o material complementar passou a ser aberto sob demanda, sem rolagem interna.

Isso não equivale a conformidade completa. Ainda precisam de validação humana na versão publicada: percurso somente por teclado, VoiceOver/TalkBack, zoom de 200%, contraste medido em todos os estados e telas reais nos viewports previstos.

## Respostas e progressão

Variantes importadas que usam letras (`a`, `b`, `c`) como gabarito são normalizadas em `src/curriculum.ts` para o texto da alternativa. N1 reconhece uma informação por vez; N2 conecta informações diretas; N3 aplica em uma situação de rotina; N4 compara condições; N5 decide e justifica com evidências.

Na alfabetização, o início parte do alfabeto antes das sílabas. A progressão inclui palavras de 1, 2, 3, 4 e 5 sílabas em contextos visuais. Em Matemática, fundamentos numéricos precedem as operações; números romanos são complementares e não definem, sozinhos, o nível de Adição/Subtração.

## Sondagem inicial

A sondagem usa 60 itens calibrados (uma combinação competência × nível). Para cada competência, começa no N1: acerto avança um nível; erro encerra a progressão e registra o nível imediatamente anterior, com piso N1. O resultado é independente por competência. São no mínimo 12 e no máximo 60 respostas; o RH pode revisar o nivelamento.

## Fontes e autoria

Os materiais EJA, Ensino Fundamental, Ensino Médio, Kumon e bancos enviados orientam habilidades, exemplos e dificuldade. Os itens são autorais e não reproduzem literalmente material de terceiros.

## Histórico de sincronização

- Gate UX v2 (candidata `7300435`): 66 testes aprovados, build aprovado, diff revisado para segredos, dados pessoais e escopo; rollback definido em `APPDEPLOY_SYNC.md`.

- Snapshot de referência anterior: `1787699639513`.
- Snapshot da Entrega 3: `1787704289733` (QA sem erros de frontend, backend ou rede).
- Entrega 4: fundamentos numéricos separados como pré-etapa de Adição/Subtração; snapshot de código `1787705002938`.

## Linha de base UX v2 — 2026-08-26

Esta seção registra a regressão funcional reproduzida antes da implementação da UX v2. A versão/commit de referência é `7a9f80d167d98165ddd84da6ef65352cdc6d37dd` (branch `codex/ux-v2`). A auditoria visual anterior é uma referência conceitual externa; suas capturas não estão neste repositório e nenhuma captura é alegada como evidência versionada aqui.

### Fluxos P0 reproduzidos

Os passos abaixo descrevem a reprodução na sessão autenticada disponível, sem inventar credenciais ou dados de participantes.

1. **RH sem conteúdo**
   1. Entrar pelo portal central com um perfil autorizado à Administração RH.
   2. Abrir **Administração RH** no menu lateral.
   3. Observar o conteúdo principal após o menu ficar selecionado.
   4. Resultado reproduzido: o menu muda de estado, mas a Home permanece no conteúdo principal; o painel RH não abre nem apresenta estado de carregamento, vazio ou erro recuperável.
2. **Sondagem reiniciando**
   1. Abrir **Sondagem inicial** em uma sessão autenticada sem diagnóstico concluído.
   2. Responder ao primeiro item e avançar para o item seguinte.
   3. Sair da sondagem, voltar à Home e abrir **Sondagem inicial** novamente.
   4. Resultado reproduzido: a sondagem volta ao primeiro item, sem retomar o ponto alcançado.
3. **Resposta aberta genérica**
   1. Abrir uma unidade que contenha uma questão de resposta aberta de alfabetização/leitura.
   2. Escrever uma resposta pertinente ao enunciado e enviá-la.
   3. Observar o feedback exibido após o envio.
   4. Resultado reproduzido: a mensagem usa linguagem genérica de cálculo/justificativa, incompatível com a resposta aberta de leitura/escrita, em vez de explicar o próximo passo de revisão.
4. **Conclusão silenciosa**
   1. Na mesma unidade, preencher e enviar a resposta aberta final.
   2. Aguardar a conclusão do envio e observar a tela seguinte.
   3. Reabrir **Tarefas diárias** ou **Meu desenvolvimento** para localizar o resultado.
   4. Resultado reproduzido: a aplicação retorna à Home sem confirmação persistente, sem estado visível “Aguardando correção” e sem indicar a próxima ação.
5. **Item de rima inválido**
   1. Abrir a questão de alfabetização/leitura com o enunciado sobre “O gato subiu no muro”.
   2. Conferir as alternativas oferecidas para a palavra que rima com “muro”.
   3. Resultado reproduzido: há alternativas como “medo”/“susto”, que não rimam claramente com “muro”; o item não oferece um conjunto fonologicamente válido.

### Referência visual conceitual

A auditoria UX de 26 de agosto de 2026 orienta a comparação conceitual dos estados **Administração RH**, **Sondagem inicial**, **questão/feedback**, **conclusão**, **Aguardando correção** e **Meu desenvolvimento**. Os nomes de captura (`05-home-autenticada.jpg`, `15-sondagem-inicial.jpg`, `17-retomada-sondagem.jpg`, `22-painel-rh-visao-geral.jpg` e demais itens da auditoria) identificam evidências externas; não são arquivos presentes no repositório.

### Linha de base automatizada

- `cd app && npm test` passou com **20 testes**.
- `cd app && npm run build` passou no commit base `7a9f80d167d98165ddd84da6ef65352cdc6d37dd`.
- O workflow `.github/workflows/university-ci.yml` confirma a mesma sequência (`npm ci`, `npm test`, `npm run build`) em Node.js 20, com `app` como diretório de trabalho.

## Aceite pós-publicação UX v2 — 2026-08-26

- Release publicada: snapshot AppDeploy `1787763567892`, estado `ready`.
- Telemetria do gate remoto: nenhum erro de frontend, backend ou rede.
- Rota pública e proteção de acesso verificadas no produto publicado: sem sessão válida, `/universidade.html#universidade` mostra o formulário da Universidade e não expõe conteúdo privado.
- Evidência capturada: `02-universidade-login-viewport.jpg`; o screenshot full-page foi descartado por não representar corretamente o viewport.
- A suíte executável do AppDeploy foi reconciliada em `app/tests/tests.txt` com cinco percursos: recorrente, retomada da sondagem, respostas objetiva/aberta, RH e bloqueio sem sessão.

### Limite da validação autenticada

A sessão do Cloud Browser usada anteriormente não estava mais disponível após a publicação. Por isso, não foram declarados como aprovados nem foram simulados com credenciais: primeiro acesso, retomada real, recorrente, resposta aberta/pendente e RH. Esses percursos continuam pendentes de uma nova sessão autenticada. O bloqueio é de evidência manual, não do gate automatizado: 66 testes e o build permanecem verdes.
