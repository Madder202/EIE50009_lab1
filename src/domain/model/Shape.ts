import { Style } from './Style.js';
import type { ShapeSink } from '../ports/ShapeSink.js';
import type { ShapeView } from './ShapeView.js';
export abstract class Shape {
  readonly #id: string;
  #style = new Style();
  protected constructor(id: string) {
    if (!id || /\s/.test(id)) throw new Error('invalid id: ' + id);
    this.#id = id;
  }
  get id(): string { return this.#id; }
  abstract get tag(): string;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  protected abstract geometry(): Readonly<Record<string, string>>;
  protected abstract setOwnAttribute(attribute: string, value: string): boolean;
  protected content(): string | undefined { return undefined; }
  setAttribute(attribute: string, value: string): void {
    if (!this.#style.set(attribute, value) && !this.setOwnAttribute(attribute, value)) {
      throw new Error('unknown attribute: ' + attribute);
    }
  }
  protected copyStyleTo(target: Shape): void { target.#style = this.#style.clone(); }
  protected childViews(): readonly ShapeView[] { return Object.freeze([]); }
  describe(): ShapeView {
    const text = this.content();
    return Object.freeze({ id: this.id, tag: this.tag,
      attributes: Object.freeze({ ...this.geometry(), ...this.#style.attributes() }),
      ...(text === undefined ? {} : { text }), children: this.childViews() });
  }
  emit(sink: ShapeSink): void {
    sink.begin(this.tag, { id: this.id, ...this.geometry(), ...this.#style.attributes() });
    const text = this.content();
    if (text !== undefined) sink.text(text);
    this.emitChildren(sink);
    sink.end(this.tag);
  }
  protected emitChildren(_sink: ShapeSink): void {}
}
