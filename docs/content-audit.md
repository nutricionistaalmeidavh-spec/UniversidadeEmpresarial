# Auditoria do banco de questões

Auditoria executada sobre o snapshot v80 (`1787686999001`) após a revisão de variação.

## Resultado

- 12 competências.
- 5 níveis por competência.
- 60 unidades.
- 180 atividades (3 por unidade).
- 0 enunciados repetidos após normalização de acentos, pontuação e prefixos de competência.
- 0 pares com similaridade lexical Jaccard igual ou superior a 0,75.
- Todas as atividades de escolha têm a resposta correta entre as alternativas.
- Todas as atividades têm enunciado e dica de correção.
- Todas as 180 atividades têm contexto visual acessível, com imagem inline e texto alternativo; a imagem varia por competência, nível e posição da atividade.

## Limite identificado e correção

O primeiro relatório usava apenas similaridade lexical Jaccard com limite de 0,75. Esse teste detecta duplicação quase literal, mas pode deixar passar duas perguntas com o mesmo molde e palavras centrais compartilhadas. Por isso, a revisão manual também verifica a forma da tarefa, o verbo de ação e a habilidade mobilizada. Em Leitura N1, por exemplo, a pergunta que localizava a palavra da placa foi trocada por uma tarefa de identificação da letra inicial de `ENTRADA`, preservando o nível e mudando a operação cognitiva.

A auditoria está automatizada em `app/tests/content-audit.test.ts`; qualquer nova questão que viole esses limites falha no teste.

## Ajustes de variedade realizados

As três competências de Comunicação no N1 tinham uma concentração excessiva em juntar sílabas (Leitura, Compreensão e Escrita). Elas foram separadas por habilidade:

- Leitura N1: localizar palavras em placas e etiquetas.
- Compreensão N1: localizar ação, horário e pessoa em frases curtas.
- Escrita N1: registrar nome, setor e confirmação funcional.

Leitura N1 também foi conferida quanto à quantidade silábica: há uma atividade com palavra de 1 sílaba (`SOL`), uma com 2 (`BO-TA`) e uma com 3 (`EN-TRA-DA`). Essa regra está protegida por teste automatizado.

Nos níveis seguintes, a progressão inclui exposição explícita a palavras mais longas: `FERRAMENTA` com 4 sílabas em N2 e `ORGANIZAÇÃO` com 5 sílabas em N3. Isso mantém N1 acessível e amplia gradualmente a complexidade.

Também foi alterado um par de Multiplicação N5 que perguntava, em sequência, o total da Equipe A e o total da Equipe B. O segundo item agora confere o cálculo de uma produção já registrada, mudando a operação cognitiva sem mudar a dificuldade.

## Como a sondagem inicial funciona

A sondagem não aplica as 180 atividades. Ela usa um banco calibrado de **60 itens**, um item representativo para cada combinação competência × nível (12 × N1–N5).

Para cada uma das 12 competências:

1. começa no item N1;
2. resposta correta avança um nível, até N5;
3. resposta incorreta encerra a progressão daquela competência e registra o nível imediatamente anterior, com piso N1;
4. passa para a próxima competência;
5. envia ao backend um resultado independente por competência (`level:N1` … `level:N5`).

Assim, o colaborador pode estar em N3 em Leitura e N1 em Divisão. O diagnóstico não calcula uma média única e não deixa uma competência mascarar outra.

São no mínimo 12 respostas (uma tentativa que encerra cada competência em N1) e no máximo 60 (acerto contínuo até N5 em todas). O nivelamento é por habilidade e pode ser revisado pelo RH.

As questões da sondagem são as primeiras atividades de cada unidade N1–N5, com objetivo, fonte pedagógica e metadados de auditoria associados. Elas não são copiadas literalmente dos materiais de referência.
