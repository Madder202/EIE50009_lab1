import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
export class Rectangle extends Shape {
  #x: number;
  #y: number;
  #width: number;
  #height: number;
  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(id);
    this.#x = Numbers.finite(x);
    this.#y = Numbers.finite(y);
    this.#width = Numbers.nonNegative(width);
    this.#height = Numbers.nonNegative(height);
  }
  override get tag(): string { return 'rect'; }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    const x = Numbers.finite(this.#x + dx);
    const y = Numbers.finite(this.#y + dy);
    this.#x = x;
    this.#y = y;
  }
  override scale(factor: number): void {
    Numbers.factor(factor);
    const x = Numbers.finite(this.#x * factor);
    const y = Numbers.finite(this.#y * factor);
    const width = Numbers.finite(this.#width * factor);
    const height = Numbers.finite(this.#height * factor);
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
  }
  protected override geometry(): Readonly<Record<string, string>> {
    return { x: String(this.#x), y: String(this.#y), width: String(this.#width), height: String(this.#height) };
  }
  protected override setOwnAttribute(attribute: string, value: string): boolean {
    if (attribute === 'x') { this.#x = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'y') { this.#y = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'width') { this.#width = Numbers.nonNegative(Numbers.parse(value)); return true; }
    if (attribute === 'height') { this.#height = Numbers.nonNegative(Numbers.parse(value)); return true; }
    return false;
  }
  override clone(): Rectangle {
    const copy = new Rectangle(this.id, this.#x, this.#y, this.#width, this.#height);
    this.copyStyleTo(copy);
    return copy;
  }
}
