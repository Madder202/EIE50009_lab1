import type { EditorSession } from '../EditorSession.js';
import type { DocumentDisplay } from '../ports/DocumentDisplay.js';
import type { Command } from './Command.js';
export class ShowCommand implements Command {
  readonly #id: string;
  readonly #display: DocumentDisplay;
  constructor(args: readonly string[], display: DocumentDisplay) {
    if (args.length < 1 || args.length > 1) throw new Error('usage: show <id>');
    this.#id = args[0]!; this.#display = display;
  }
  execute(session: EditorSession): string { return this.#display.show(session.document(), this.#id); }
}
