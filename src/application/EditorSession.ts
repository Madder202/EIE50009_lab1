import { SvgDocument } from '../domain/model/SvgDocument.js';
export class EditorSession {
  #document: SvgDocument | undefined;
  initialize(width: number, height: number): void {
    const candidate = new SvgDocument(width, height);
    this.#document = candidate;
  }
  document(): SvgDocument {
    if (!this.#document) throw new Error("no document. use 'init' or 'read' first");
    return this.#document;
  }
}
