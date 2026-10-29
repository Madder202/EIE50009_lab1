import type { CommandDispatcher } from '../application/CommandDispatcher.js';
import type { EditorSession } from '../application/EditorSession.js';
import { CommandLineParser } from './CommandLineParser.js';
import { ErrorFormatter } from './ErrorFormatter.js';
export class Repl {
  readonly #parser = new CommandLineParser();
  readonly #errors = new ErrorFormatter();
  constructor(private readonly dispatcher: CommandDispatcher, private readonly session: EditorSession) {}
  evaluate(line: string): string | undefined {
    try { return this.dispatcher.dispatch(this.#parser.parse(line), this.session); }
    catch (error) { return this.#errors.format(error); }
  }
}
