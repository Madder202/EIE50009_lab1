export class XmlElement {
  readonly #name: string;
  readonly #attributes: Readonly<Record<string, string>>;
  #children: XmlElement[] = [];
  #text = '';
  constructor(name: string, attributes: Record<string, string>) {
    this.#name = name; this.#attributes = Object.freeze({ ...attributes });
  }
  get name(): string { return this.#name; }
  get attributes(): Readonly<Record<string, string>> { return this.#attributes; }
  get text(): string { return this.#text; }
  children(): readonly XmlElement[] { return [...this.#children]; }
  append(child: XmlElement): void { this.#children.push(child); }
  appendText(text: string): void { this.#text += text; }
}
