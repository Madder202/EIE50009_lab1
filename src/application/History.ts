import type { HistoryEntry } from './HistoryEntry.js';
import type { HistoryTransition } from './HistoryTransition.js';
export class History {
  readonly #undo: readonly HistoryEntry[];
  readonly #redo: readonly HistoryEntry[];
  readonly #blocked: boolean;
  private constructor(undo: readonly HistoryEntry[], redo: readonly HistoryEntry[], blocked: boolean) {
    this.#undo = [...undo]; this.#redo = [...redo]; this.#blocked = blocked;
  }
  static barrier(): History { return new History([], [], true); }
  record(entry: HistoryEntry): History { return new History([...this.#undo, entry], [], false); }
  undo(): HistoryTransition {
    this.checkBarrier();
    const entry = this.#undo.at(-1);
    if (!entry) throw new Error('nothing to undo');
    return { document: entry.restoreBefore(), history: new History(this.#undo.slice(0, -1), [...this.#redo, entry], false), message: 'undone: ' + entry.summary };
  }
  redo(): HistoryTransition {
    this.checkBarrier();
    const entry = this.#redo.at(-1);
    if (!entry) throw new Error('nothing to redo');
    return { document: entry.restoreAfter(), history: new History([...this.#undo, entry], this.#redo.slice(0, -1), false), message: 'redone: ' + entry.summary };
  }
  private checkBarrier(): void {
    if (this.#blocked) throw new Error('undo not allowed after io command');
  }
}
