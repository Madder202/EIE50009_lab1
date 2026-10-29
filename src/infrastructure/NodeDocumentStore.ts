import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DocumentStore } from '../application/ports/DocumentStore.js';
export class NodeDocumentStore implements DocumentStore {
  read(path: string): string {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(path)); }
    catch { throw new Error('cannot read file: ' + path); }
  }
  write(path: string, content: string): void {
    const temporary = join(dirname(path), '.' + basename(path) + '.' + randomUUID() + '.tmp');
    try {
      writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
      renameSync(temporary, path);
    } catch {
      throw new Error('cannot write file: ' + path);
    } finally {
      try { unlinkSync(temporary); } catch { /* Already renamed, or never created. */ }
    }
  }
}
