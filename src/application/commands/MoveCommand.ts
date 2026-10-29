import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
import { Numbers } from '../../domain/model/Numbers.js';
export class MoveCommand extends EditCommand {
  readonly #id: string;
  readonly #dx: number;
  readonly #dy: number;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 3) throw new Error('usage: move <id> <dx> <dy>');
    this.#id = args[0]!;
    this.#dx = Numbers.parse(args[1]!);
    this.#dy = Numbers.parse(args[2]!);
  }
  override apply(document: SvgDocument): string {
    const node = document.describe(this.#id);
    const label = `${node.tag}#${node.id}`;
    document.move(this.#id, this.#dx, this.#dy);
    return `${label} moved by (${this.#dx},${this.#dy})`;
  }
}
