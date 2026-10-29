import type { ShapeView } from '../domain/model/ShapeView.js';
export class ShapeFormatter {
  format(view: ShapeView): string {
    const attributes = Object.entries(view.attributes).map(([name, value]) => `${name}=${value}`).join(' ');
    return `${view.tag}#${view.id}${attributes ? '  ' + attributes : ''}${view.text === undefined ? '' : ' ' + JSON.stringify(view.text)}`;
  }
}
