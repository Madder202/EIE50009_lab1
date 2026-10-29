import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
export class TextShape extends Shape {
  #x: number;
  #y: number;
  #text: string;
  constructor(id: string, x: number, y: number, text: string) {
    super(id);
    this.#x = Numbers.finite(x);
    this.#y = Numbers.finite(y);
    this.#text = text;
  }
  override get tag(): string { return 'text'; }
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
    this.#x = x;
    this.#y = y;
  }
  protected override geometry(): Readonly<Record<string, string>> {
    return { x: String(this.#x), y: String(this.#y) };
  }
  protected override setOwnAttribute(attribute: string, value: string): boolean {
    if (attribute === 'x') { this.#x = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'y') { this.#y = Numbers.finite(Numbers.parse(value)); return true; }
    if (attribute === 'text') { this.#text = value; return true; }
    return false;
  }
  protected override content(): string { return this.#text; }
  override clone(): TextShape {
    const copy = new TextShape(this.id, this.#x, this.#y, this.#text);
    this.copyStyleTo(copy);
    return copy;
  }
}
