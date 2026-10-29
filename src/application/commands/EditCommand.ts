import type { SvgDocument } from '../../domain/model/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { Command } from './Command.js';
export abstract class EditCommand implements Command {
  execute(session: EditorSession): string { return session.executeEdit(this); }
  abstract apply(document: SvgDocument): string;
}
