import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
export class Line extends Shape {
  #x1: number;
  #y1: number;
  #x2: number;
  #y2: number;
  constructor(id: string, x1: number, y1: number, x2: number, y2: number) {
    super(id);
    this.#x1 = Numbers.finite(x1);
    this.#y1 = Numbers.finite(y1);
    this.#x2 = Numbers.finite(x2);
    this.#y2 = Numbers.finite(y2);
  }
  override get tag(): string { return 'line'; }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    const x1 = Numbers.finite(this.#x1 + dx);
    const y1 = Numbers.finite(this.#y1 + dy);
    const x2 = Numbers.finite(this.#x2 + dx);
    const y2 = Numbers.finite(this.#y2 + dy);
    this.#x1 = x1;
    this.#y1 = y1;
    this.#x2 = x2;
    this.#y2 = y2;
  }
  override scale(factor: number): void {
    Numbers.factor(factor);
    const x1 = Numbers.finite(this.#x1 * factor);
    const y1 = Numbers.finite(this.#y1 * factor);
    const x2 = Numbers.finite(this.#x2 * factor);
    const y2 = Numbers.finite(this.#y2 * factor);
    this.#x1 = x1;
    this.#y1 = y1;
    this.#x2 = x2;
    this.#y2 = y2;
  }
  protected override geometry(): Readonly<Record<string, string>> {
    return { x1: String(this.#x1), y1: String(this.#y1), x2: String(this.#x2), y2: String(this.#y2) };
  }
  protected override setOwnAttribute(attribute: string, value: string): boolean {
    if (attribute === 'x1') { this.#x1 = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'y1') { this.#y1 = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'x2') { this.#x2 = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'y2') { this.#y2 = Numbers.finite(Numbers.parse(value)); return true; }
    return false;
  }
  override clone(): Line {
    const copy = new Line(this.id, this.#x1, this.#y1, this.#x2, this.#y2);
    this.copyStyleTo(copy);
    return copy;
  }
}
