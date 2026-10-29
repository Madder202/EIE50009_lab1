export interface DocumentStore {
  read(path: string): string;
  write(path: string, content: string): void;
}
