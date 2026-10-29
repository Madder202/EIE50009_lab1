export class ErrorFormatter {
  format(error: unknown): string {
    const message = error instanceof Error ? error.message : 'unexpected failure';
    return 'error: ' + message.replace(/[\r\n]+/g, ' ');
  }
}
