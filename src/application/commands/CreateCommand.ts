import type { ShapeFactory } from '../../domain/factory/ShapeFactory.js';
import type { Shape } from '../../domain/model/Shape.js';
import type { CommandToken } from '../CommandToken.js';
import type { EditorSession } from '../EditorSession.js';
import type { Command } from './Command.js';
export class CreateCommand implements Command {
  readonly #shape: Shape;
  readonly #parent: string | undefined;
  constructor(tokens: readonly CommandToken[], factory: ShapeFactory) {
    if (tokens.length < 2) throw new Error('usage: create <type> <id> [params] [in <containerId>]');
    const params = tokens.slice(2);
    const marker = params.at(-2);
    if (marker?.value === 'in' && !marker.quoted) {
      this.#parent = params.at(-1)!.value;
      params.splice(-2);
    }
    this.#shape = factory.create(tokens[0]!.value, tokens[1]!.value, params.map(token => token.value));
  }
  execute(session: EditorSession): string {
    session.document().add(this.#shape, this.#parent);
    return `${this.#shape.tag}#${this.#shape.id} created${this.#parent === undefined ? '' : ' in g#' + this.#parent}`;
  }
}
