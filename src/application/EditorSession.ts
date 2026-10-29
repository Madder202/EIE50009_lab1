import type { DocumentStore } from './ports/DocumentStore.js';
import type { DocumentCodec } from './ports/DocumentCodec.js';
import { SvgDocument } from '../domain/model/SvgDocument.js';
import { History } from './History.js';
import { HistoryEntry } from './HistoryEntry.js';
import type { EditCommand } from './commands/EditCommand.js';
import type { HistoryTransition } from './HistoryTransition.js';
export class EditorSession {
  #document: SvgDocument | undefined;
  #history = History.barrier();
  #readPath: string | undefined;
  constructor(private readonly store?: DocumentStore, private readonly codec?: DocumentCodec) {}
  read(path: string): string {
    if (!this.store || !this.codec) throw new Error('document IO is not configured');
    const source = this.store.read(path);
    let decoded: ReturnType<DocumentCodec['decode']>;
    try { decoded = this.codec.decode(source); }
    catch (error) { throw new Error('invalid SVG: ' + (error instanceof Error ? error.message : String(error))); }
    const history = History.barrier();
    const message = [...decoded.warnings, `read ${path} (${decoded.document.size} elements)`].join('\n');
    this.#document = decoded.document; this.#history = history; this.#readPath = path;
    return message;
  }
  save(path?: string): string {
    const document = this.document();
    const target = path ?? this.#readPath;
    if (!target) throw new Error('no default path. use save <file.svg>');
    if (!this.store || !this.codec) throw new Error('document IO is not configured');
    const content = this.codec.encode(document);
    const history = History.barrier();
    const message = `saved to ${target} (${document.size} elements)`;
    this.store.write(target, content);
    this.#history = history;
    return message;
  }
  canvas(width?: number, height?: number): string {
    const document = this.document();
    if (width === undefined && height === undefined) return `canvas ${document.width}x${document.height}`;
    if (width === undefined || height === undefined) throw new Error('usage: canvas [w h]');
    const candidate = document.clone(); candidate.resize(width, height);
    const history = History.barrier();
    this.#document = candidate; this.#history = history;
    return `canvas ${width}x${height} resized`;
  }
  initialize(width: number, height: number): void {
    const candidate = new SvgDocument(width, height);
    const history = History.barrier();
    this.#document = candidate; this.#history = history; this.#readPath = undefined;
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
