import { Ellipse } from '../model/Ellipse.js';
import { Numbers } from '../model/Numbers.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class EllipseDefinition implements ShapeDefinition {
  fromSvg(id: string, text: string): Ellipse {
    if (text.trim()) throw new Error('unexpected text content');
    return new Ellipse(id, 0, 0, 0, 0);
  }
  create(id: string, args: readonly string[]): Ellipse {
    if (args.length < 4 || args.length > 5) throw new Error('invalid parameters for Ellipse');
    const shape = new Ellipse(id , Numbers.parse(args[0]!), Numbers.parse(args[1]!), Numbers.parse(args[2]!), Numbers.parse(args[3]!));
    if (args[4] !== undefined) shape.setAttribute('fill', args[4]);
    return shape;
  }
}
