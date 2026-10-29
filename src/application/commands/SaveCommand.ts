import type { Command } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class SaveCommand implements Command {
  readonly #path: string | undefined;
  constructor(args: readonly string[]) {
    if (args.length < 0 || args.length > 1 || args[0] === '') throw new Error('usage: save [file.svg]');
    this.#path = args[0];
  }
  execute(session: EditorSession): string { return session.save(this.#path); }
}
