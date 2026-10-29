import { Rectangle } from '../model/Rectangle.js';
import { Numbers } from '../model/Numbers.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class RectangleDefinition implements ShapeDefinition {
  fromSvg(id: string, text: string): Rectangle {
    if (text.trim()) throw new Error('unexpected text content');
    return new Rectangle(id, 0, 0, 0, 0);
  }
  create(id: string, args: readonly string[]): Rectangle {
    if (args.length < 4 || args.length > 5) throw new Error('invalid parameters for Rectangle');
    const shape = new Rectangle(id , Numbers.parse(args[0]!), Numbers.parse(args[1]!), Numbers.parse(args[2]!), Numbers.parse(args[3]!));
    if (args[4] !== undefined) shape.setAttribute('fill', args[4]);
    return shape;
  }
}
