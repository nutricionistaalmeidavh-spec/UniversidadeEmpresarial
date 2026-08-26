import { describe, expect, it } from 'vitest';
import { selectSupportExcerpt } from '../src/support-selector';

describe('material de apoio por microtema', () => {
  it('seleciona o trecho do tema e limita leitura', () => {
    const material = '1. SOMA\nSome os valores.\nExemplo 2+2=4.\n\n2. DIVISÃO\nDivida em grupos iguais.\nExemplo 12÷3=4.\nConfira multiplicando.\nDetalhe opcional.';
    const result = selectSupportExcerpt({ material, competency: 'divisao', level: 'N2', topic: 'divisão', maxEssential: 80 });
    expect(result.essential).toContain('DIVISÃO');
    expect(result.essential).not.toContain('SOMA');
    expect(result.essential.length).toBeLessThanOrEqual(80);
  });
  it('usa explicação específica da competência quando o tópico não existe', () => {
    expect(selectSupportExcerpt({ material: 'outro assunto', competency: 'divisao', level: 'N1', topic: 'repartição' }).essential).toContain('grupos iguais');
  });
});
