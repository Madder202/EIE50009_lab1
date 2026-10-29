export interface ShapeView {
  readonly id: string;
  readonly tag: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly text?: string;
  readonly children: readonly ShapeView[];
}
