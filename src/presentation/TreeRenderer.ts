import type { SvgDocument } from '../domain/model/SvgDocument.js';
import type { ShapeView } from '../domain/model/ShapeView.js';
import { ShapeFormatter } from './ShapeFormatter.js';
export class TreeRenderer {
  readonly #formatter = new ShapeFormatter();
  render(document: SvgDocument, id?: string): string {
    const root = id === undefined ? undefined : document.describe(id);
    const lines = [root ? this.#formatter.format(root) : `svg (${document.width}x${document.height})`];
    this.children(root?.children ?? document.tree(), '', lines);
    return lines.join('\n');
  }
  private children(nodes: readonly ShapeView[], prefix: string, lines: string[]): void {
    nodes.forEach((node, index) => {
      const last = index === nodes.length - 1;
      lines.push(prefix + (last ? '└── ' : '├── ') + this.#formatter.format(node));
      this.children(node.children, prefix + (last ? '    ' : '│   '), lines);
    });
  }
}
