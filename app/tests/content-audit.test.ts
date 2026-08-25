import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/curriculum';

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
  });

  it('não repete enunciados nem alternativas corretas entre as unidades', () => {
    const prompts = rows.map(row => normalize(row.item.prompt));
    expect(new Set(prompts).size).toBe(prompts.length);
    expect(rows.every(({ item }) => item.kind === 'text' || item.options?.includes(item.answer))).toBe(true);
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
    expect(prompts.some(prompt => prompt.includes('uma silaba'))).toBe(true);
    expect(prompts.some(prompt => prompt.includes('duas silabas'))).toBe(true);
    expect(prompts.some(prompt => prompt.includes('tres silabas'))).toBe(true);
    expect(CONTENT['leitura-N1'].material).toContain('SOL = 1 sílaba');
    expect(CONTENT['leitura-N1'].material).toContain('BO-TA = 2 sílabas');
    expect(CONTENT['leitura-N1'].material).toContain('EN-TRA-DA = 3 sílabas');
  });
});
