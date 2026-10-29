import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
export class Ellipse extends Shape {
  #cx: number;
  #cy: number;
  #rx: number;
  #ry: number;
  constructor(id: string, cx: number, cy: number, rx: number, ry: number) {
    super(id);
    this.#cx = Numbers.finite(cx);
    this.#cy = Numbers.finite(cy);
    this.#rx = Numbers.nonNegative(rx);
    this.#ry = Numbers.nonNegative(ry);
  }
  override get tag(): string { return 'ellipse'; }
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
    const rx = Numbers.finite(this.#rx * factor);
    const ry = Numbers.finite(this.#ry * factor);
    this.#cx = cx;
    this.#cy = cy;
    this.#rx = rx;
    this.#ry = ry;
  }
  protected override geometry(): Readonly<Record<string, string>> {
    return { cx: String(this.#cx), cy: String(this.#cy), rx: String(this.#rx), ry: String(this.#ry) };
  }
  protected override setOwnAttribute(attribute: string, value: string): boolean {
    if (attribute === 'cx') { this.#cx = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'cy') { this.#cy = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'rx') { this.#rx = Numbers.nonNegative(Numbers.parse(value)); return true; }
    if (attribute === 'ry') { this.#ry = Numbers.nonNegative(Numbers.parse(value)); return true; }
    return false;
  }
  override clone(): Ellipse {
    const copy = new Ellipse(this.id, this.#cx, this.#cy, this.#rx, this.#ry);
    this.copyStyleTo(copy);
    return copy;
  }
}
