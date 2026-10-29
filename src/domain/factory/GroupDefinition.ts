import { Group } from '../model/Group.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class GroupDefinition implements ShapeDefinition {
  fromSvg(id: string, text: string): Group {
    if (text.trim()) throw new Error('unexpected text content');
    return new Group(id);
  }
  create(id: string, args: readonly string[]): Group {
    if (args.length !== 0) throw new Error('invalid parameters for Group');
    const shape = new Group(id);
    return shape;
  }
}
