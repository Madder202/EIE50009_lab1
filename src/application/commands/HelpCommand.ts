import type { Command } from './Command.js';
export class HelpCommand implements Command {
  readonly #help: string;
  constructor(args: readonly string[], help: string) {
    if (args.length) throw new Error('usage: help');
    this.#help = help;
  }
  execute(): string { return this.#help; }
}
