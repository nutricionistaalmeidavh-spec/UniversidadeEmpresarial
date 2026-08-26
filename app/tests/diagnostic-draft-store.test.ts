import { describe, expect, it } from 'vitest';
import {
  clearDiagnosticDraft,
  type DiagnosticDraftRecord,
  type DiagnosticDraftStore,
  diagnosticDraftTable,
  readDiagnosticDraft,
  saveDiagnosticDraft,
  type StoredDiagnosticDraftRecord,
} from '../backend/diagnostic-draft-store';
import type { DiagnosticDraft } from '../backend/diagnostic-draft';

class MemoryDraftStore implements DiagnosticDraftStore {
  private rows = new Map<string, StoredDiagnosticDraftRecord[]>();
  private sequence = 0;

  async list(table: string) {
    return [...(this.rows.get(table) || [])];
  }

  async add(table: string, record: DiagnosticDraftRecord) {
    const row = { ...record, id: `draft-${++this.sequence}` };
    this.rows.set(table, [...(this.rows.get(table) || []), row]);
  }

  async update(table: string, id: string, record: DiagnosticDraftRecord) {
    this.rows.set(table, (this.rows.get(table) || []).map(row => (row.id === id ? { ...record, id } : row)));
  }

  async delete(table: string, id: string) {
    this.rows.set(table, (this.rows.get(table) || []).filter(row => row.id !== id));
  }
}

const draft = (skillIndex: number, level: number): DiagnosticDraft => ({
  version: 1,
  skillIndex,
  level,
  assigned: { leitura: 'level:N2' },
  updatedAt: '2026-08-26T12:00:00.000Z',
});

describe('persistência do rascunho da sondagem', () => {
  it('salva, lê e atualiza o mesmo rascunho sem duplicar registros', async () => {
    const store = new MemoryDraftStore();
    await saveDiagnosticDraft(store, 'participant-1', draft(2, 3));
    await saveDiagnosticDraft(store, 'participant-1', draft(4, 5));

    const saved = await readDiagnosticDraft(store, 'participant-1');
    expect(saved?.skillIndex).toBe(4);
    expect(saved?.level).toBe(5);
    expect((await store.list(diagnosticDraftTable('participant-1')))).toHaveLength(1);
  });

  it('isola o rascunho por participante', async () => {
    const store = new MemoryDraftStore();
    await saveDiagnosticDraft(store, 'participant-1', draft(1, 2));
    await saveDiagnosticDraft(store, 'participant-2', draft(7, 3));

    expect((await readDiagnosticDraft(store, 'participant-1'))?.skillIndex).toBe(1);
    expect((await readDiagnosticDraft(store, 'participant-2'))?.skillIndex).toBe(7);
  });

  it('limpa somente o rascunho solicitado e informa se havia registro', async () => {
    const store = new MemoryDraftStore();
    await saveDiagnosticDraft(store, 'participant-1', draft(1, 2));
    await saveDiagnosticDraft(store, 'participant-2', draft(2, 3));

    expect(await clearDiagnosticDraft(store, 'participant-1')).toBe(true);
    expect(await clearDiagnosticDraft(store, 'participant-1')).toBe(false);
    expect(await readDiagnosticDraft(store, 'participant-1')).toBeNull();
    expect(await readDiagnosticDraft(store, 'participant-2')).not.toBeNull();
  });
});
