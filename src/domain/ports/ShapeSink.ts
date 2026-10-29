export interface ShapeSink {
  begin(tag: string, attributes: Readonly<Record<string, string>>): void;
  text(content: string): void;
  end(tag: string): void;
}
