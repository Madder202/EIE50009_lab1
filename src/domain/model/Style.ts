import { Numbers } from './Numbers.js';
export class Style {
  #values = new Map<string, string>();
  set(attribute: string, value: string): boolean {
    if (attribute !== 'fill' && attribute !== 'stroke' && attribute !== 'stroke-width') return false;
    const checked = attribute === 'stroke-width' ? String(Numbers.nonNegative(Numbers.parse(value))) : value;
    this.#values.set(attribute, checked);
    return true;
  }
  attributes(): Readonly<Record<string, string>> { return Object.freeze(Object.fromEntries(this.#values)); }
  clone(): Style {
    const copy = new Style();
    copy.#values = new Map(this.#values);
    return copy;
  }
}
