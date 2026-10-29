import { TextShape } from '../model/TextShape.js';
import { Numbers } from '../model/Numbers.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class TextDefinition implements ShapeDefinition {
  create(id: string, args: readonly string[]): TextShape {
    if (args.length !== 3) throw new Error('invalid parameters for TextShape');
    const shape = new TextShape(id , Numbers.parse(args[0]!), Numbers.parse(args[1]!), args[2]!);
    return shape;
  }
}
