import type { Shape } from '../model/Shape.js';
export interface ShapeDefinition { fromSvg(id: string, text: string): Shape; create(id: string, args: readonly string[]): Shape; }
