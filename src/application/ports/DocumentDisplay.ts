import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export interface DocumentDisplay {
  tree(document: SvgDocument, id?: string): string;
  show(document: SvgDocument, id: string): string;
}
