import { Numbers } from '../../domain/model/Numbers.js';
import type { EditorSession } from '../EditorSession.js';
import type { Command } from './Command.js';
export class InitCommand implements Command {
  readonly #width: number;
  readonly #height: number;
  constructor(args: readonly string[]) {
    if (args.length > 2) throw new Error('usage: init [w] [h]');
    this.#width = args[0] === undefined ? 800 : Numbers.parse(args[0]);
    this.#height = args[1] === undefined ? 600 : Numbers.parse(args[1]);
  }
  execute(session: EditorSession): string {
    session.initialize(this.#width, this.#height);
    return `canvas ${this.#width}x${this.#height} created`;
  }
}
