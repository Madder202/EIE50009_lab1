import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export class GroupCommand extends EditCommand {
  readonly #id: string;
  readonly #targets: readonly string[];
  constructor(args: readonly string[]) {
    super();
    if (args.length < 3) throw new Error('usage: group <newGid> <id1> <id2>…');
    this.#id = args[0]!; this.#targets = args.slice(1);
  }
  override apply(document: SvgDocument): string {
    document.group(this.#id, this.#targets);
    return `g#${this.#id} created with ${this.#targets.length} children`;
  }
}
