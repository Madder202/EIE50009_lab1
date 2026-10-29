import { DocumentMemento } from '../domain/model/DocumentMemento.js';
import type { SvgDocument } from '../domain/model/SvgDocument.js';
export class HistoryEntry {
  readonly #before: DocumentMemento;
  readonly #after: DocumentMemento;
  readonly #summary: string;
  constructor(before: SvgDocument, after: SvgDocument, summary: string) {
    this.#before = new DocumentMemento(before);
    this.#after = new DocumentMemento(after);
    this.#summary = summary;
  }
  restoreBefore(): SvgDocument { return this.#before.restore(); }
  restoreAfter(): SvgDocument { return this.#after.restore(); }
  get summary(): string { return this.#summary; }
}
