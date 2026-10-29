import { Canvas } from './Canvas.js';
import { Shape } from './Shape.js';
import { ContainerShape } from './ContainerShape.js';
import { Group } from './Group.js';
import type { ShapeView } from './ShapeView.js';
import type { ShapeSink } from '../ports/ShapeSink.js';
export class SvgDocument {
  #canvas: Canvas;
  #nodes = new Map<string, Shape>();
  #parents = new Map<string, ContainerShape>();
  constructor(width = 800, height = 600) { this.#canvas = new Canvas(width, height); }
  get width(): number { return this.#canvas.width; }
  get height(): number { return this.#canvas.height; }
  get size(): number { return this.#nodes.size; }
  has(id: string): boolean { return this.#nodes.has(id); }
  describe(id: string): ShapeView { return this.require(id).describe(); }
  tree(): readonly ShapeView[] { return this.#canvas.describe().children; }
  parentId(id: string): string | null {
    this.require(id);
    const parent = this.#parents.get(id)!;
    return parent === this.#canvas ? null : parent.id;
  }
  resize(width: number, height: number): void { this.#canvas.resize(width, height); }
  add(shape: Shape, parentId?: string): void {
    if (shape instanceof Canvas) throw new Error('cannot add canvas as a shape');
    this.mutate(draft => {
      const parent = parentId === undefined ? draft.#canvas : draft.container(parentId);
      parent.insertOwned(shape.clone());
    });
  }
  move(id: string, dx: number, dy: number): void { this.mutate(draft => draft.require(id).move(dx, dy)); }
  scale(id: string, factor: number): void { this.mutate(draft => draft.require(id).scale(factor)); }
  setAttribute(id: string, attribute: string, value: string): void {
    this.mutate(draft => draft.require(id).setAttribute(attribute, value));
  }
  delete(id: string): void {
    this.mutate(draft => { draft.require(id); draft.#parents.get(id)!.removeOwned(id); });
  }
  addTo(containerId: string, id: string): void {
    this.mutate(draft => {
      const target = draft.container(containerId);
      const node = draft.require(id);
      let cursor: ContainerShape | undefined = target;
      while (cursor && cursor !== draft.#canvas) {
        if (cursor === node) throw new Error('cannot create containment cycle');
        cursor = draft.#parents.get(cursor.id);
      }
      draft.#parents.get(id)!.removeOwned(id);
      target.insertOwned(node);
    });
  }
  emit(sink: ShapeSink): void { this.#canvas.emit(sink); }
  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height);
    copy.#canvas = this.#canvas.clone();
    copy.reindex();
    return copy;
  }
  /** Rebuild indexes only after validating the complete candidate tree. */
  private reindex(): void {
    const nodes = new Map<string, Shape>();
    const parents = new Map<string, ContainerShape>();
    const seen = new Set<Shape>();
    const visit = (parent: ContainerShape): void => {
      parent.visitOwned(child => {
        if (seen.has(child)) throw new Error('shape has multiple parents or containment cycle');
        if (child instanceof Canvas) throw new Error('cannot add canvas as a shape');
        if (nodes.has(child.id)) throw new Error('id already exists: ' + child.id);
        seen.add(child); nodes.set(child.id, child); parents.set(child.id, parent);
        if (child instanceof ContainerShape) visit(child);
      });
    };
    visit(this.#canvas);
    this.#nodes = nodes; this.#parents = parents;
  }
  private mutate(operation: (draft: SvgDocument) => void): void {
    const draft = this.clone();
    operation(draft);
    draft.reindex();
    this.#canvas = draft.#canvas; this.#nodes = draft.#nodes; this.#parents = draft.#parents;
  }
  private require(id: string): Shape {
    const shape = this.#nodes.get(id);
    if (!shape) throw new Error('no such shape: ' + id);
    return shape;
  }
  private container(id: string): Group {
    const shape = this.#nodes.get(id);
    if (!shape) throw new Error('no such container: ' + id);
    if (!(shape instanceof Group)) throw new Error('not a container: ' + id);
    return shape;
  }
}
