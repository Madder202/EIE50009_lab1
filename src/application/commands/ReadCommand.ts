import type { Command } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class ReadCommand implements Command {
  readonly #path: string;
  constructor(args: readonly string[]) {
    if (args.length < 1 || args.length > 1 || args[0] === '') throw new Error('usage: read <file.svg>');
    this.#path = args[0]!;
  }
  execute(session: EditorSession): string { return session.read(this.#path); }
}
