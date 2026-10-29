import { MoveCommand } from './commands/MoveCommand.js';
import { ScaleCommand } from './commands/ScaleCommand.js';
import { SetCommand } from './commands/SetCommand.js';
import { DeleteCommand } from './commands/DeleteCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import type { CommandToken } from './CommandToken.js';
import type { Command } from './commands/Command.js';
import { InitCommand } from './commands/InitCommand.js';
import { CreateCommand } from './commands/CreateCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import { HelpCommand } from './commands/HelpCommand.js';
import type { ShapeFactory } from '../domain/factory/ShapeFactory.js';
import type { DocumentDisplay } from './ports/DocumentDisplay.js';
import type { EditorSession } from './EditorSession.js';
export class CommandDispatcher {
  // R01: sole command-name dispatch, also the source of implemented help entries.
  readonly #commands: Map<string, { syntax: string; build: (args: readonly CommandToken[]) => Command }>;
  constructor(factory: ShapeFactory, display: DocumentDisplay) {
    this.#commands = new Map([
      ['init', { syntax: 'init [w] [h]', build: args => new InitCommand(args.map(t => t.value)) }],
      ['create', { syntax: 'create <type> <id> [params] [in <containerId>]', build: args => new CreateCommand(args, factory) }],
      ['move', { syntax: 'move <id> <dx> <dy>', build: args => new MoveCommand(args.map(t => t.value)) }],
      ['scale', { syntax: 'scale <id> <factor>', build: args => new ScaleCommand(args.map(t => t.value)) }],
      ['set', { syntax: 'set <id> <attr> <value>', build: args => new SetCommand(args.map(t => t.value)) }],
      ['delete', { syntax: 'delete <id>', build: args => new DeleteCommand(args.map(t => t.value)) }],
      ['undo', { syntax: 'undo', build: args => new UndoCommand(args.map(t => t.value)) }],
      ['redo', { syntax: 'redo', build: args => new RedoCommand(args.map(t => t.value)) }],
      ['tree', { syntax: 'tree [id]', build: args => new TreeCommand(args.map(t => t.value), display) }],
      ['show', { syntax: 'show <id>', build: args => new ShowCommand(args.map(t => t.value), display) }],
      ['help', { syntax: 'help', build: args => new HelpCommand(args.map(t => t.value), this.help()) }],
    ]);
  }
  dispatch(tokens: readonly CommandToken[], session: EditorSession): string | undefined {
    if (!tokens.length) return undefined;
    const definition = this.#commands.get(tokens[0]!.value);
    if (!definition) throw new Error('unknown command: ' + tokens[0]!.value);
    return definition.build(tokens.slice(1)).execute(session);
  }
  private help(): string {
    return ['Available commands:', ...Array.from(this.#commands.values(), d => '  ' + d.syntax),
      'Create parameters (after type and id):',
      '  rect x y w h [fill]', '  circle cx cy r [fill]', '  ellipse cx cy rx ry [fill]',
      '  line x1 y1 x2 y2 [stroke]', '  text x y "content"', '  g',
      'All types support: in <containerId>', 'Other Phase 1 commands are not implemented yet.'].join('\n');
  }
}
