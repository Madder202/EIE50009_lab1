import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export class FrontCommand extends EditCommand {
  readonly #id: string;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 1) throw new Error('usage: front <id>');
    this.#id = args[0]!;
  }
  override apply(document: SvgDocument): string {
    const node = document.describe(this.#id);
    document.front(this.#id);
    return `${node.tag}#${this.#id} moved to front`;
  }
}
