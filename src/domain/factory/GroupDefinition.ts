import { Group } from '../model/Group.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
export class GroupDefinition implements ShapeDefinition {
  create(id: string, args: readonly string[]): Group {
    if (args.length !== 0) throw new Error('invalid parameters for Group');
    const shape = new Group(id);
    return shape;
  }
}
