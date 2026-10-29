import type { Command } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class UndoCommand implements Command {
  constructor(args: readonly string[]) {
    if (args.length) throw new Error('usage: undo');
  }
  execute(session: EditorSession): string { return session.undo(); }
}
