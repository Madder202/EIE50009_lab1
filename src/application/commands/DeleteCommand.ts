import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
export class DeleteCommand extends EditCommand {
  readonly #id: string;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 1) throw new Error('usage: delete <id>');
    this.#id = args[0]!;
  }
  override apply(document: SvgDocument): string {
    const node = document.describe(this.#id);
    const label = `${node.tag}#${node.id}`;
    document.delete(this.#id);
    return `${label} deleted`;
  }
}
