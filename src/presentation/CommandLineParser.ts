import type { CommandToken } from '../application/CommandToken.js';
export class CommandLineParser {
  parse(line: string): readonly CommandToken[] {
    if (!line.trim() || line.trimStart().startsWith('#')) return [];
    const tokens: CommandToken[] = [];
    let index = 0;
    while (index < line.length) {
      if (/\s/.test(line[index]!)) { index++; continue; }
      let value = '';
      const quoted = line[index] === '"';
      if (quoted) {
        index++;
        let closed = false;
        while (index < line.length) {
          const char = line[index++]!;
          if (char === '"') { closed = true; break; }
          if (char === '\\' && (line[index] === '"' || line[index] === '\\')) value += line[index++]!;
          else value += char;
        }
        if (!closed) throw new Error('unterminated double quote');
        if (index < line.length && !/\s/.test(line[index]!)) throw new Error('expected whitespace after quote');
      } else {
        while (index < line.length && !/\s/.test(line[index]!)) {
          if (line[index] === '"') throw new Error('quote must start a parameter');
          value += line[index++]!;
        }
      }
      tokens.push(Object.freeze({ value, quoted }));
    }
    return Object.freeze(tokens);
  }
}
