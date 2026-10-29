import { ContainerShape } from './ContainerShape.js';
import { Numbers } from './Numbers.js';
import type { ShapeSink } from '../ports/ShapeSink.js';
export class Canvas extends ContainerShape {
  #width: number;
  #height: number;
  constructor(width = 800, height = 600) {
    super('$canvas');
    this.#width = Numbers.positive(width);
    this.#height = Numbers.positive(height);
  }
  override get tag(): string { return 'svg'; }
  get width(): number { return this.#width; }
  get height(): number { return this.#height; }
  resize(width: number, height: number): void {
    Numbers.positive(width); Numbers.positive(height);
    this.#width = width; this.#height = height;
  }
  override emit(sink: ShapeSink): void {
    sink.begin('svg', { xmlns: 'http://www.w3.org/2000/svg', width: String(this.#width), height: String(this.#height), viewBox: `0 0 ${this.#width} ${this.#height}` });
    this.emitChildren(sink);
    sink.end('svg');
  }
  override clone(): Canvas {
    const copy = new Canvas(this.#width, this.#height);
    this.copyChildrenTo(copy);
    return copy;
  }
}
