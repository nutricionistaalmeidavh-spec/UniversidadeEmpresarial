# Integração central do snapshot v95

Ao aplicar este overlay sobre o repositório, confira especialmente os arquivos centrais `src/university.ts`, `src/curriculum.ts`, `src/university.css`, `src/support-materials.ts` e `backend/education.ts` do seu checkout. O AppDeploy v95 em produção contém as integrações abaixo.

## Nomenclatura visível
- `Capacitação em Comunicação`
- `Capacitação em Leitura`
- `Capacitação em Compreensão`
- `Capacitação em Escrita`
- `Capacitação Matemática` e seus conteúdos
- `Capacitação para o Trabalho`
- Não exibir títulos/frases com “alfabetização”. Identificadores internos de arquivos-fontes podem permanecer quando necessários à compatibilidade.

## Trilhas e progresso
- “Meu desenvolvimento” foi incorporado a “Trilhas e progresso”.
- Tela mostra Aprendizado 1/2/3, percentuais, “RECOMENDADO AGORA”, Continue daqui, áreas e competências.
- Estados coerentes: Em correção, Revisão disponível, Em prática, Em andamento, Recomendada agora, Fortalecida, Não iniciada.

## Tela de área
- Conteúdo com largura ampliada.
- Hero em duas colunas.
- Guia MH/mascote estático no canto direito com mensagem contextual.
- Cards usam grid responsivo e aproveitam melhor a largura.

## Aula
- `LessonAttempt` congelada e persistente.
- `buildLessonComposition(id, seed, selectionVersion)`; novas tentativas usam `selectionVersion=2`.
- V2 prioriza questões que possuem imagem mapeada sem quebrar tentativas antigas.
- Apoio essencial aparece **antes do enunciado**, sempre visível, e não em card recolhível no fim.
- Imagem vem entre o apoio e o enunciado quando houver mapeamento.
- Questões sem imagem não exibem falso “Carregando”.
- Falha real de imagem mapeada exibe `Imagem de apoio indisponível.`.

## Diagnóstico e progresso
- Sondagem V2: aproximadamente 15, máximo 18.
- Cinco níveis internos N1–N5 continuam no motor; colaborador vê Aprendizado 1/2/3.
- Nivelamento contínuo persiste confiança por competência.

## Aulas e revisão
- Parte 1: apoio + 3 questões.
- Parte 2: novo apoio + 6 questões.
- N2/N4/N5: fechamento de 4 questões.
- Reforço adaptativo de 3 questões quando necessário.
- Revisões curtas de 3–5 questões, normalmente 4, com rotação e prioridade para erros.

## Tutor / papel
- Tutor por colaborador.
- Preparação e reroll apenas antes da primeira resposta.
- Impressão usa a mesma LessonAttempt.
- Respostas `tutor-paper` não sobrescrevem respostas online.

## Recursos
- `public/resources/question-assets-549.zip` contém o manifesto + 549 WebPs otimizados.
- `src/question-visual-index.ts` contém o índice de prompts mapeados usado para evitar falso loading.
