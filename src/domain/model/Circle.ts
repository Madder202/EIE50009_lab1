import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
export class Circle extends Shape {
  #cx: number;
  #cy: number;
  #r: number;
  constructor(id: string, cx: number, cy: number, r: number) {
    super(id);
    this.#cx = Numbers.finite(cx);
    this.#cy = Numbers.finite(cy);
    this.#r = Numbers.nonNegative(r);
  }
  override get tag(): string { return 'circle'; }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    const cx = Numbers.finite(this.#cx + dx);
    const cy = Numbers.finite(this.#cy + dy);
    this.#cx = cx;
    this.#cy = cy;
  }
  override scale(factor: number): void {
    Numbers.factor(factor);
    const cx = Numbers.finite(this.#cx * factor);
    const cy = Numbers.finite(this.#cy * factor);
    const r = Numbers.finite(this.#r * factor);
    this.#cx = cx;
    this.#cy = cy;
    this.#r = r;
  }
  protected override geometry(): Readonly<Record<string, string>> {
    return { cx: String(this.#cx), cy: String(this.#cy), r: String(this.#r) };
  }
  protected override setOwnAttribute(attribute: string, value: string): boolean {
    if (attribute === 'cx') { this.#cx = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'cy') { this.#cy = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'r') { this.#r = Numbers.nonNegative(Numbers.parse(value)); return true; }
    return false;
  }
  override clone(): Circle {
    const copy = new Circle(this.id, this.#cx, this.#cy, this.#r);
    this.copyStyleTo(copy);
    return copy;
  }
}
