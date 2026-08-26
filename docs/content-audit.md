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
- respostas abertas preservadas como texto para revisão humana;
- imagem gerada para cada item exibido, sempre com texto alternativo;
- ausência de duplicidade exata após normalização;
- similaridade lexical Jaccard ≥ 0,75 reportada para revisão, sem apagar automaticamente o conteúdo;
- limite de três questões selecionadas por unidade.

Na última execução não houve duplicidade exata. Foram sinalizados três pares lexicalmente próximos para revisão editorial futura; eles não são cópias literais e mantêm objetivos distintos.

## Respostas e progressão

Variantes importadas que usam letras (`a`, `b`, `c`) como gabarito são normalizadas em `src/curriculum.ts` para o texto da alternativa. N1 reconhece uma informação por vez; N2 conecta informações diretas; N3 aplica em uma situação de rotina; N4 compara condições; N5 decide e justifica com evidências.

Na alfabetização, o início parte do alfabeto antes das sílabas. A progressão inclui palavras de 1, 2, 3, 4 e 5 sílabas em contextos visuais. Em Matemática, fundamentos numéricos precedem as operações; números romanos são complementares e não definem, sozinhos, o nível de Adição/Subtração.

## Sondagem inicial

A sondagem usa 60 itens calibrados (uma combinação competência × nível). Para cada competência, começa no N1: acerto avança um nível; erro encerra a progressão e registra o nível imediatamente anterior, com piso N1. O resultado é independente por competência. São no mínimo 12 e no máximo 60 respostas; o RH pode revisar o nivelamento.

## Fontes e autoria

Os materiais EJA, Ensino Fundamental, Ensino Médio, Kumon e bancos enviados orientam habilidades, exemplos e dificuldade. Os itens são autorais e não reproduzem literalmente material de terceiros.

## Histórico de sincronização

- Snapshot de referência anterior: `1787699639513`.
- Snapshot da Entrega 3: `1787704227152` (QA sem erros de frontend, backend ou rede).
