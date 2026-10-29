import type { SvgDocument } from '../domain/model/SvgDocument.js';
import type { History } from './History.js';
export interface HistoryTransition {
  readonly document: SvgDocument;
  readonly history: History;
  readonly message: string;
}
