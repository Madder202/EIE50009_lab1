import type { Command } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class RedoCommand implements Command {
  constructor(args: readonly string[]) {
    if (args.length) throw new Error('usage: redo');
  }
  execute(session: EditorSession): string { return session.redo(); }
}
