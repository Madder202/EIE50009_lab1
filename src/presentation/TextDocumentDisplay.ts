import type { DocumentDisplay } from '../application/ports/DocumentDisplay.js';
import type { SvgDocument } from '../domain/model/SvgDocument.js';
import { TreeRenderer } from './TreeRenderer.js';
import { ShowRenderer } from './ShowRenderer.js';
export class TextDocumentDisplay implements DocumentDisplay {
  readonly #tree = new TreeRenderer();
  readonly #show = new ShowRenderer();
  tree(document: SvgDocument, id?: string): string { return this.#tree.render(document, id); }
  show(document: SvgDocument, id: string): string { return this.#show.render(document, id); }
}
