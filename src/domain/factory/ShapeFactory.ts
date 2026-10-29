import { RectangleDefinition } from './RectangleDefinition.js';
import { CircleDefinition } from './CircleDefinition.js';
import { EllipseDefinition } from './EllipseDefinition.js';
import { LineDefinition } from './LineDefinition.js';
import { TextDefinition } from './TextDefinition.js';
import { GroupDefinition } from './GroupDefinition.js';
import type { ShapeDefinition } from './ShapeDefinition.js';
import type { Shape } from '../model/Shape.js';
export class ShapeFactory {
  // R02: the sole shape-name dispatch; future registration is out of scope.
  readonly #definitions = new Map<string, ShapeDefinition>([
    ['rect', new RectangleDefinition()], ['circle', new CircleDefinition()],
    ['ellipse', new EllipseDefinition()], ['line', new LineDefinition()],
    ['text', new TextDefinition()], ['g', new GroupDefinition()],
  ]);
  fromSvg(type: string, id: string, attributes: Readonly<Record<string, string>>, text: string): Shape {
    const definition = this.definition(type);
    const shape = definition.fromSvg(id, text);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'id') continue;
      if (key === 'text') throw new Error('unknown attribute: text');
      shape.setAttribute(key, value);
    }
    return shape;
  }
  private definition(type: string): ShapeDefinition {
    const definition = this.#definitions.get(type);
    if (!definition) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return definition;
  }
  create(type: string, id: string, args: readonly string[]): Shape {
    return this.definition(type).create(id, args);
  }
}
