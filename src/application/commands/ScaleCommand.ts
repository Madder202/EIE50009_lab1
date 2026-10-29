import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../../domain/model/SvgDocument.js';
import { Numbers } from '../../domain/model/Numbers.js';
export class ScaleCommand extends EditCommand {
  readonly #id: string;
  readonly #factor: number;
  constructor(args: readonly string[]) {
    super();
    if (args.length !== 2) throw new Error('usage: scale <id> <factor>');
    this.#id = args[0]!;
    this.#factor = Numbers.parse(args[1]!);
  }
  override apply(document: SvgDocument): string {
    const node = document.describe(this.#id);
    const label = `${node.tag}#${node.id}`;
    document.scale(this.#id, this.#factor);
    return `${label} scaled by ${this.#factor}`;
  }
}
