import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export class BackCommand extends EditCommand {
  readonly #id: string;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 1) throw new Error('usage: back <id>');
    this.#id = args[0]!;
  }
  override apply(document: SvgDocument): string {
    const node = document.describe(this.#id);
    document.back(this.#id);
    return `${node.tag}#${this.#id} moved to back`;
  }
}
