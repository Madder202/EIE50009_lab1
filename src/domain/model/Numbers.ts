export class Numbers {
  static finite(value: number): number {
    if (!Number.isFinite(value)) throw new Error('number must be finite');
    return Object.is(value, -0) ? 0 : value;
  }
  static nonNegative(value: number): number {
    const result = this.finite(value);
    if (result < 0) throw new Error('dimension must be non-negative');
    return result;
  }
  static positive(value: number): number {
    const result = this.finite(value);
    if (result <= 0) throw new Error('dimension must be positive');
    return result;
  }
  static factor(value: number): number {
    if (!Number.isFinite(value) || value <= 0) throw new Error('scale factor must be positive');
    return value;
  }
  static parse(value: string): number {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) throw new Error('invalid number: ' + value);
    return this.finite(Number(value));
  }
}
