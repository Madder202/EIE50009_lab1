import { Line } from '../model/Line.js';
import { Numbers } from '../model/Numbers.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class LineDefinition implements ShapeDefinition {
  fromSvg(id: string, text: string): Line {
    if (text.trim()) throw new Error('unexpected text content');
    return new Line(id, 0, 0, 0, 0);
  }
  create(id: string, args: readonly string[]): Line {
    if (args.length < 4 || args.length > 5) throw new Error('invalid parameters for Line');
    const shape = new Line(id , Numbers.parse(args[0]!), Numbers.parse(args[1]!), Numbers.parse(args[2]!), Numbers.parse(args[3]!));
    if (args[4] !== undefined) shape.setAttribute('stroke', args[4]);
    return shape;
  }
}
