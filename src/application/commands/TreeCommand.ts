import type { EditorSession } from '../EditorSession.js';
import type { DocumentDisplay } from '../ports/DocumentDisplay.js';
import type { Command } from './Command.js';
export class TreeCommand implements Command {
  readonly #id: string | undefined;
  readonly #display: DocumentDisplay;
  constructor(args: readonly string[], display: DocumentDisplay) {
    if (args.length < 0 || args.length > 1) throw new Error('usage: tree [id]');
    this.#id = args[0]; this.#display = display;
  }
  execute(session: EditorSession): string { return this.#display.tree(session.document(), this.#id); }
}
