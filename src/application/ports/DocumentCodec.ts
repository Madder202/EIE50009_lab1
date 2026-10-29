import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export interface DocumentCodec {
  decode(source: string): { readonly document: SvgDocument; readonly warnings: readonly string[] };
  encode(document: SvgDocument): string;
}
