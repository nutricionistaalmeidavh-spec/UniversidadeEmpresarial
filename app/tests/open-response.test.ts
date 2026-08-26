import { describe, expect, it } from 'vitest';
import { hasActivePendingReview, normalizeOpenResponses } from '../backend/open-response-policy';
import { evaluateLessonAnswer, lessonAccessViewModel, lessonAttemptFeedback, lessonFeedbackViewModel } from '../src/lesson-feedback';
import { ADDITIONAL_VARIANTS } from '../src/additional-bank';

describe('respostas da unidade', () => {
  it('oferece feedback contextual com ação recuperável', () => {
    expect(lessonAttemptFeedback({ correct: false, hint: 'Compare os grupos.', objective: 'Dividir em partes iguais' })).toMatchObject({ tone: 'error', action: 'Tentar novamente', hint: 'Compare os grupos.' });
    expect(lessonAttemptFeedback({ correct: true, objective: 'Dividir em partes iguais' })).toMatchObject({ tone: 'success', action: 'Continuar' });
    expect(lessonAttemptFeedback({ correct: null })).toMatchObject({ tone: 'pending', action: 'Continuar' });
  });
  it('mantém choice e short-text como respostas objetivas normalizadas', () => {
    expect(evaluateLessonAnswer({ kind: 'choice', answer: 'Sim' }, ' sim ')).toEqual({ valid: true, correct: true });
    expect(evaluateLessonAnswer({ kind: 'short-text', answer: 'N', accept: ['ene'] }, 'Ene')).toEqual({ valid: true, correct: true });
    expect(evaluateLessonAnswer({ kind: 'short-text', answer: 'N' }, 'M')).toEqual({ valid: true, correct: false });
  });

  it('trata text como resposta aberta, sem marcar acerto ou erro no cliente', () => {
    expect(evaluateLessonAnswer({ kind: 'text', answer: '' }, '  Sim.  ')).toEqual({ valid: true, correct: null });
    expect(evaluateLessonAnswer({ kind: 'text', answer: '' }, '   ')).toEqual({ valid: false, correct: null });
  });

  it('respeita minLength somente quando o item aberto o configura', () => {
    expect(evaluateLessonAnswer({ kind: 'text', answer: '', minLength: 12 }, 'Resposta curta')).toEqual({ valid: true, correct: null });
    expect(evaluateLessonAnswer({ kind: 'text', answer: '', minLength: 12 }, 'Curta')).toEqual({ valid: false, correct: null });
  });

  it.each([
    ['Escreva os números de 1 a 20 em ordem crescente.', 40],
    ['Escreva três palavras que comecem com a sílaba "BA" (ex.: bala).', 12],
    ['Separe em sílabas: janela, sapato, computador, relógio.', 20],
    ['Forme cinco palavras diferentes usando as sílabas: TA, TE, TI, TO, TU.', 20],
    ['Escreva duas frases contando o que foi feito no turno.', 40],
  ])('rejeita resposta de uma letra para a atividade multipartes: %s', (prompt, minimum) => {
    const item = ADDITIONAL_VARIANTS.find(variant => variant.prompt === prompt);

    expect(item).toMatchObject({ kind: 'text', minLength: minimum });
    expect(evaluateLessonAnswer(item!, 'a')).toEqual({ valid: false, correct: null });
  });

  it('mantém em um caractere a resposta unitária declarada', () => {
    const item = ADDITIONAL_VARIANTS.find(variant => variant.prompt === 'Circule o número maior: 6 ou 9.');

    expect(item).toMatchObject({ kind: 'text', minLength: 1 });
    expect(evaluateLessonAnswer(item!, '9')).toEqual({ valid: true, correct: null });
  });
});

describe('normalização de respostas abertas no servidor', () => {
  it('descarta respostas vazias e limita quantidade e tamanhos', () => {
    const responses = normalizeOpenResponses([
      { question: '   Pergunta   ', response: '   resposta   ', itemIndex: 3 },
      { question: 'Ignorar', response: '   ', itemIndex: 4 },
      ...Array.from({ length: 10 }, (_, index) => ({
        question: `q${index}`.repeat(700),
        response: `r${index}`.repeat(2500),
        itemIndex: index,
      })),
    ]);

    expect(responses).toHaveLength(10);
    expect(responses[0]).toEqual({ question: 'Pergunta', response: 'resposta', itemIndex: 3 });
    expect(responses[1]?.question).toHaveLength(1000);
    expect(responses[1]?.response).toHaveLength(4000);
    expect(responses.every(response => response.response.trim().length > 0)).toBe(true);
  });
});

describe('feedback persistente da unidade', () => {
  it.each([
    ['correct', 'Resposta correta', 'Próxima atividade'],
    ['incorrect', 'Revise sua resposta', 'Tentar novamente'],
    ['practice', 'Continuar praticando', 'Próxima atividade'],
    ['pending_review', 'Aguardando correção', 'Próxima atividade'],
    ['completed', 'Unidade concluída', 'Próxima atividade'],
  ] as const)('explica o estado %s com próxima ação explícita', (state, title, nextAction) => {
    const feedback = lessonFeedbackViewModel(state);

    expect(feedback.title).toBe(title);
    expect(feedback.body.trim().length).toBeGreaterThan(20);
    expect(feedback.nextAction).toBe(nextAction);
  });

  it('bloqueia a aula pendente no cliente e preserva as ações de navegação', () => {
    expect(lessonAccessViewModel('pending_review')).toEqual({
      readOnly: true,
      feedback: lessonFeedbackViewModel('pending_review'),
    });
    expect(lessonAccessViewModel('practice')).toEqual({ readOnly: false, feedback: null });
  });
});

describe('proteção contra reenvio antes da correção RH', () => {
  it('bloqueia somente uma pendência ativa da mesma unidade', () => {
    const reviews = [{ unit: 'leitura-N1' }];

    expect(hasActivePendingReview('pending_review', reviews, 'leitura-N1')).toBe(true);
    expect(hasActivePendingReview('pending_review', reviews, 'leitura-N2')).toBe(false);
  });

  it('permite reenvio depois de solicitação de revisão', () => {
    expect(hasActivePendingReview('practice', [{ unit: 'leitura-N1' }], 'leitura-N1')).toBe(false);
  });
});
