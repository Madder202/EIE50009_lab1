import type { SvgDocument } from '../domain/model/SvgDocument.js';
export class ShowRenderer {
  render(document: SvgDocument, id: string): string {
    const view = document.describe(id);
    const parent = document.parentId(id);
    return [`${view.tag}#${id}  parent=${parent === null ? 'svg' : 'g#' + parent}`,
      ...Object.entries(view.attributes).map(([name, value]) => `  ${name}=${value}`),
      ...(view.text === undefined ? [] : ['  text=' + JSON.stringify(view.text)])].join('\n');
  }
}
