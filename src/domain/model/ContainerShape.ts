import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
import type { ShapeView } from './ShapeView.js';
import type { ShapeSink } from '../ports/ShapeSink.js';
export abstract class ContainerShape extends Shape {
  static readonly #owners = new WeakMap<Shape, ContainerShape>();
  #children: Shape[] = [];
  /** Structural primitives are for the owning document; it never exposes its nodes. */
  insertOwned(shape: Shape, index = this.#children.length): void {
    if (!Number.isInteger(index) || index < 0 || index > this.#children.length) throw new Error('invalid child index');
    if (shape === this || (shape instanceof ContainerShape && shape.containsIdentity(this))) throw new Error('cannot create containment cycle');
    if (ContainerShape.#owners.has(shape)) throw new Error('child already attached');
    this.#children.splice(index, 0, shape);
    ContainerShape.#owners.set(shape, this);
  }
  removeOwned(id: string): Shape {
    const index = this.#children.findIndex(child => child.id === id);
    if (index < 0) throw new Error('no such shape: ' + id);
    const removed = this.#children.splice(index, 1)[0]!;
    ContainerShape.#owners.delete(removed);
    return removed;
  }
  indexOf(id: string): number { return this.#children.findIndex(child => child.id === id); }
  /** Callback access is internal to domain ownership, not part of Editor query APIs. */
  visitOwned(visitor: (child: Shape) => void): void { this.#children.forEach(visitor); }
  private containsIdentity(shape: Shape): boolean {
    return this.#children.some(child => child === shape || (child instanceof ContainerShape && child.containsIdentity(shape)));
  }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    const next = this.#children.map(child => child.clone());
    next.forEach(child => child.move(dx, dy));
    this.#children.forEach(child => ContainerShape.#owners.delete(child));
    next.forEach(child => ContainerShape.#owners.set(child, this));
    this.#children = next;
  }
  override scale(factor: number): void {
    Numbers.factor(factor);
    const next = this.#children.map(child => child.clone());
    next.forEach(child => child.scale(factor));
    this.#children.forEach(child => ContainerShape.#owners.delete(child));
    next.forEach(child => ContainerShape.#owners.set(child, this));
    this.#children = next;
  }
  protected override geometry(): Readonly<Record<string, string>> { return {}; }
  protected override setOwnAttribute(_attribute: string, _value: string): boolean { return false; }
  protected override childViews(): readonly ShapeView[] { return Object.freeze(this.#children.map(child => child.describe())); }
  protected override emitChildren(sink: ShapeSink): void { this.#children.forEach(child => child.emit(sink)); }
  protected copyChildrenTo(target: ContainerShape): void {
    this.#children.forEach(child => target.insertOwned(child.clone()));
    this.copyStyleTo(target);
  }
}
