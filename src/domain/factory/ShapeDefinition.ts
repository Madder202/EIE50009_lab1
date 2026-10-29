import type { Shape } from '../model/Shape.js';
export interface ShapeDefinition { create(id: string, args: readonly string[]): Shape; }
