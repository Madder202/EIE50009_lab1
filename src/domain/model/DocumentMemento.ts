import { SvgDocument } from './SvgDocument.js';
export class DocumentMemento {
  readonly #snapshot: SvgDocument;
  constructor(document: SvgDocument) { this.#snapshot = document.clone(); }
  restore(): SvgDocument { return this.#snapshot.clone(); }
}
