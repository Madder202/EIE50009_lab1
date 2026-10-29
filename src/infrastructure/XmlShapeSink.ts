import type { ShapeSink } from '../domain/ports/ShapeSink.js';
export class XmlShapeSink implements ShapeSink {
  #parts = ['<?xml version="1.0" encoding="UTF-8"?>\n'];
  begin(tag: string, attributes: Readonly<Record<string, string>>): void {
    this.#parts.push('<' + tag + Object.entries(attributes).map(([key, value]) => ` ${key}="${this.escape(value)}"`).join('') + '>');
  }
  text(content: string): void { this.#parts.push(this.escape(content)); }
  end(tag: string): void { this.#parts.push('</' + tag + '>'); }
  result(): string { return this.#parts.join('') + '\n'; }
  private escape(value: string): string {
    if (/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u.test(value)) throw new Error('invalid XML character');
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
      .replace(/\r/g, '&#13;').replace(/\n/g, '&#10;').replace(/\t/g, '&#9;');
  }
}
