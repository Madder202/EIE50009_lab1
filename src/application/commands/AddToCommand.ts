import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export class AddToCommand extends EditCommand {
  readonly #container: string;
  readonly #id: string;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 2) throw new Error('usage: addto <gid> <id>');
    this.#container = args[0]!; this.#id = args[1]!;
  }
  override apply(document: SvgDocument): string {
    document.addTo(this.#container, this.#id);
    return `${document.describe(this.#id).tag}#${this.#id} moved into g#${this.#container}`;
  }
}
