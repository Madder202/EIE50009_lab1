import { SvgDocument } from '../domain/model/SvgDocument.js';
import { History } from './History.js';
import { HistoryEntry } from './HistoryEntry.js';
import type { EditCommand } from './commands/EditCommand.js';
import type { HistoryTransition } from './HistoryTransition.js';
export class EditorSession {
  #document: SvgDocument | undefined;
  #history = History.barrier();
  initialize(width: number, height: number): void {
    const candidate = new SvgDocument(width, height);
    const history = History.barrier();
    this.#document = candidate; this.#history = history;
  }
  document(): SvgDocument {
    if (!this.#document) throw new Error("no document. use 'init' or 'read' first");
    return this.#document;
  }
  executeEdit(command: EditCommand): string {
    const before = this.document();
    const candidate = before.clone();
    const summary = command.apply(candidate);
    const history = this.#history.record(new HistoryEntry(before, candidate, summary));
    // All fallible work is complete. Publish document and history together.
    this.#document = candidate; this.#history = history;
    return summary;
  }
  undo(): string { this.document(); return this.publish(this.#history.undo()); }
  redo(): string { this.document(); return this.publish(this.#history.redo()); }
  private publish(transition: HistoryTransition): string {
    this.#document = transition.document; this.#history = transition.history;
    return transition.message;
  }
}
