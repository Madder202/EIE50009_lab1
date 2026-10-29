import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { EditorSession } from '../application/EditorSession.js';
import { CommandDispatcher } from '../application/CommandDispatcher.js';
import { ShapeFactory } from '../domain/factory/ShapeFactory.js';
import { TextDocumentDisplay } from '../presentation/TextDocumentDisplay.js';
import { Repl } from '../presentation/Repl.js';
export class Main {
  static run(): void {
    const repl = new Repl(new CommandDispatcher(new ShapeFactory(), new TextDocumentDisplay()), new EditorSession());
    const input = createInterface({ input: stdin, output: stdout, terminal: Boolean(stdin.isTTY && stdout.isTTY) });
    stdout.write("svg-editor 0.1 — type 'help' for commands\n");
    input.setPrompt('svg> ');
    input.prompt();
    input.on('line', line => {
      const result = repl.evaluate(line);
      if (result !== undefined) stdout.write(result + '\n');
      input.prompt();
    });
    input.on('close', () => { stdout.write('\n'); });
  }
}
Main.run();
