import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export class SetCommand extends EditCommand {
  readonly #id: string;
  readonly #attribute: string;
  readonly #value: string;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 3) throw new Error('usage: set <id> <attr> <value>');
    this.#id = args[0]!; this.#attribute = args[1]!; this.#value = args[2]!;
  }
  override apply(document: SvgDocument): string {
    const node = document.describe(this.#id);
    document.setAttribute(this.#id, this.#attribute, this.#value);
    return `${node.tag}#${node.id} updated: ${this.#attribute}=${JSON.stringify(this.#value)}`;
  }
}
