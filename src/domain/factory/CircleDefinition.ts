import { Circle } from '../model/Circle.js';
import { Numbers } from '../model/Numbers.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class CircleDefinition implements ShapeDefinition {
  fromSvg(id: string, text: string): Circle {
    if (text.trim()) throw new Error('unexpected text content');
    return new Circle(id, 0, 0, 0);
  }
  create(id: string, args: readonly string[]): Circle {
    if (args.length < 3 || args.length > 4) throw new Error('invalid parameters for Circle');
    const shape = new Circle(id , Numbers.parse(args[0]!), Numbers.parse(args[1]!), Numbers.parse(args[2]!));
    if (args[3] !== undefined) shape.setAttribute('fill', args[3]);
    return shape;
  }
}
