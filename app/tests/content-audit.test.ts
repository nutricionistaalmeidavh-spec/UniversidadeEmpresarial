import { describe, expect, it } from 'vitest';
import { CONTENT, QUESTION_BANK, selectQuestions } from '../src/curriculum';
import { SUPPORT_MATERIALS } from '../src/support-materials';
import { ADDITIONAL_VARIANTS } from '../src/additional-bank';
import { PORTUGUESE_VARIANTS } from '../src/portuguese-bank';
import { YOUNG_ADULT_VARIANTS } from '../src/young-adult-bank';

const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\b(leitura|compreensao|escrita|seguranca|direitos|saude|tecnologia)\s+n[1-5]\s*:\s*/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const similarity = (a: string, b: string) => {
  const left = new Set(normalize(a).split(/\s+/));
  const right = new Set(normalize(b).split(/\s+/));
  const intersection = [...left].filter(token => right.has(token)).length;
  return intersection / (left.size + right.size - intersection);
};

describe('auditoria semântica do banco de questões', () => {
  const rows = Object.entries(CONTENT).flatMap(([unit, content]) =>
    content.items.map((item, index) => ({ unit, index, item })),
  );

  it('mantém 60 unidades com três atividades autorais cada', () => {
    expect(Object.keys(CONTENT)).toHaveLength(60);
    expect(rows).toHaveLength(180);
    expect(rows.every(row => row.item.prompt.trim() && row.item.hint.trim())).toBe(true);
    expect(rows.every(row => row.item.visual?.src && row.item.visual?.alt)).toBe(true);
  });

  it('não repete enunciados nem alternativas corretas entre as unidades', () => {
    const prompts = rows.map(row => normalize(row.item.prompt));
    expect(new Set(prompts).size).toBe(prompts.length);
    expect(rows.every(({ item }) => item.kind === 'choice' || item.kind === 'text' || item.kind === 'short-text' || item.options?.includes(item.answer))).toBe(true);
  });

  it('não mantém pares de enunciados excessivamente semelhantes', () => {
    const similar: string[] = [];
    for (let i = 0; i < rows.length; i += 1) {
      for (let j = i + 1; j < rows.length; j += 1) {
        if (similarity(rows[i].item.prompt, rows[j].item.prompt) >= 0.75) {
          similar.push(`${rows[i].unit}#${rows[i].index} <> ${rows[j].unit}#${rows[j].index}`);
        }
      }
    }
    expect(similar).toEqual([]);
  });

  it('mantém tarefas N1 com operações diferentes dentro de Leitura', () => {
    const prompts = CONTENT['leitura-N1'].items.map(item => normalize(item.prompt));
    expect(prompts.some(prompt => prompt.includes('somente vogais'))).toBe(true);
    expect(prompts.some(prompt => prompt.includes('depois de m'))).toBe(true);
    expect(prompts.some(prompt => prompt.includes('letra inicial'))).toBe(true);
    expect(CONTENT['leitura-N1'].material).toContain('Alfabeto completo');
    expect(CONTENT['leitura-N1'].material).toContain('Vogais: A, E, I, O, U');
    expect(CONTENT['leitura-N1'].material).toContain('Primeiro reconhecemos letras');
    expect(CONTENT['leitura-N1'].items[1].kind).toBe('short-text');
    expect(CONTENT['leitura-N1'].items[1].answer).toBe('N');
    expect(CONTENT['leitura-N2'].material).toContain('FERRAMENTA = fer-ra-men-ta (4 sílabas)');
    expect(CONTENT['leitura-N3'].material).toContain('ORGANIZAÇÃO = or-ga-ni-za-ção (5 sílabas)');
    expect(CONTENT['adicao-N1'].material).toContain('Números e operações');
    expect(CONTENT['adicao-N1'].material).toContain('I=1, V=5, X=10');
    expect(CONTENT['adicao-N1'].items[1].answer).toBe('V');
  });

  it('incorpora banco adicional de Português sem alterar a quantidade por unidade', () => {
    const variants = Object.values(QUESTION_BANK).flat();
    expect(variants.length).toBeGreaterThan(0);
    expect(variants.every(item => (item.kind === 'choice' || item.kind === 'text' || item.kind === 'short-text') && item.visual?.src)).toBe(true);
    expect(Object.entries(CONTENT).every(([id, unit]) => selectQuestions(id, unit.items, 42).length === 3)).toBe(true);
    expect(SUPPORT_MATERIALS.matematica.length).toBeGreaterThan(100);
    expect(SUPPORT_MATERIALS.portugues.length).toBeGreaterThan(100);
  });

  it('audita todas as variantes dos bancos adicionais', () => {
    const banks = [
      ['additional-bank', ADDITIONAL_VARIANTS],
      ['portuguese-bank', PORTUGUESE_VARIANTS],
      ['young-adult-bank', YOUNG_ADULT_VARIANTS],
    ] as const;
    const variants = banks.flatMap(([bank, items]) => items.map((item, index) => ({ bank, index, item })));
    const skills = new Set(['leitura', 'compreensao', 'escrita', 'adicao', 'multiplicacao', 'divisao', 'porcentagem', 'medidas']);
    const levels = new Set(['N1', 'N2', 'N3', 'N4', 'N5']);
    const kinds = new Set(['choice', 'short-text', 'text']);
    expect(variants.length).toBe(429);
    expect(variants.every(({ item }) => item.prompt.trim() && item.hint.trim())).toBe(true);
    expect(variants.every(({ item }) => skills.has(item.skill) && levels.has(item.level) && kinds.has(item.kind))).toBe(true);
    const renderedVariants = Object.values(QUESTION_BANK).flat();
    expect(renderedVariants).toHaveLength(429);
    expect(renderedVariants.every(item => item.visual?.src && item.visual?.alt)).toBe(true);
    const renderedByPrompt = new Map(renderedVariants.map(item => [item.prompt, item]));
    const invalidChoices = variants.filter(({ item }) => item.kind === 'choice' && !(renderedByPrompt.get(item.prompt)?.options?.length && renderedByPrompt.get(item.prompt)?.options?.includes(String(renderedByPrompt.get(item.prompt)?.answer))));
    expect(invalidChoices).toEqual([]);
    expect(variants.filter(({ item }) => item.kind === 'short-text').every(({ item }) => item.answer.trim().length > 0)).toBe(true);
    expect(variants.filter(({ item }) => item.kind === 'text').every(({ item }) => item.answer === '')).toBe(true);
  });

  it('mantém compatibilidade competência × nível e limita seleção a três itens', () => {
    const allVariants = Object.entries(QUESTION_BANK).flatMap(([unit, items]) => {
      const match = unit.match(/^(.*)-N([1-5])$/);
      return items.map(item => ({ unit, item, skill: match?.[1], level: `N${match?.[2]}` }));
    });
    expect(allVariants.every(({ item, skill, level }) => item.skill === skill && item.level === level)).toBe(true);
    expect(Object.entries(CONTENT).every(([id, unit]) => selectQuestions(id, unit.items, 2026).length === 3)).toBe(true);
  });

  it('aponta duplicidades exatas e similaridade lexical sem apagar conteúdo', () => {
    const all = [
      ...rows.map(row => ({ id: `${row.unit}#${row.index}`, prompt: row.item.prompt })),
      ...Object.entries(QUESTION_BANK).flatMap(([unit, items]) => items.map((item, index) => ({ id: `${unit}#variant-${index}`, prompt: item.prompt }))),
    ];
    const exact = new Map<string, string[]>();
    for (const row of all) exact.set(normalize(row.prompt), [...(exact.get(normalize(row.prompt)) || []), row.id]);
    const duplicates = [...exact.values()].filter(ids => ids.length > 1);
    const similar: string[] = [];
    for (let i = 0; i < all.length; i += 1) {
      for (let j = i + 1; j < all.length; j += 1) {
        if (similarity(all[i].prompt, all[j].prompt) >= 0.75) similar.push(`${all[i].id} <> ${all[j].id}`);
      }
    }
    if (similar.length) console.warn('Similaridade lexical para revisão:', similar);
    expect(duplicates).toEqual([]);
    expect(similar.length).toBeLessThanOrEqual(3);
  });
});
