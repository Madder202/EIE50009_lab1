import type { Command } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
import { Numbers } from '../../domain/model/Numbers.js';
export class CanvasCommand implements Command {
  readonly #width: number | undefined;
  readonly #height: number | undefined;
  constructor(args: readonly string[]) {
    if (args.length !== 0 && args.length !== 2) throw new Error('usage: canvas [w h]');
    this.#width = args[0] === undefined ? undefined : Numbers.parse(args[0]);
    this.#height = args[1] === undefined ? undefined : Numbers.parse(args[1]);
  }
  execute(session: EditorSession): string { return session.canvas(this.#width, this.#height); }
}
