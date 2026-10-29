import { SaxesParser } from 'saxes';
import { SvgDocument } from '../domain/model/SvgDocument.js';
import { ContainerShape } from '../domain/model/ContainerShape.js';
import { Numbers } from '../domain/model/Numbers.js';
import type { Shape } from '../domain/model/Shape.js';
import { ShapeFactory } from '../domain/factory/ShapeFactory.js';
import type { DocumentCodec } from '../application/ports/DocumentCodec.js';
import { XmlElement } from './XmlElement.js';
import { XmlShapeSink } from './XmlShapeSink.js';
export class SvgCodec implements DocumentCodec {
  constructor(private readonly factory = new ShapeFactory()) {}
  encode(document: SvgDocument): string {
    const sink = new XmlShapeSink(); document.emit(sink); return sink.result();
  }
  decode(source: string): { document: SvgDocument; warnings: readonly string[] } {
    const root = this.parse(source);
    if (root.name !== 'svg') throw new Error('root must be svg');
    const attrs = root.attributes;
    for (const key of Object.keys(attrs)) if (!['xmlns', 'width', 'height', 'viewBox'].includes(key)) throw new Error('unsupported svg attribute: ' + key);
    if (attrs.xmlns !== 'http://www.w3.org/2000/svg') throw new Error('unsupported SVG namespace');
    const width = Numbers.positive(Numbers.parse(attrs.width ?? ''));
    const height = Numbers.positive(Numbers.parse(attrs.height ?? ''));
    if (attrs.viewBox !== undefined) {
      const values = attrs.viewBox.trim().split(/[\s,]+/).map(value => Numbers.parse(value));
      if (values.length !== 4 || values[0] !== 0 || values[1] !== 0 || values[2] !== width || values[3] !== height) throw new Error('unsupported viewBox');
    }
    if (root.text.trim()) throw new Error('unexpected text in svg');
    const reserved = new Set<string>();
    const scan = (node: XmlElement): void => {
      const id = node.attributes.id;
      if (id !== undefined && id !== '') {
        if (reserved.has(id)) throw new Error('id already exists: ' + id);
        reserved.add(id);
      }
      node.children().forEach(scan);
    };
    root.children().forEach(scan);
    const warnings: string[] = [];
    const build = (node: XmlElement): Shape => {
      let id = node.attributes.id;
      if (id === undefined || id === '') {
        let serial = 1;
        while (reserved.has(node.name + serial)) serial++;
        id = node.name + serial; reserved.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${node.name}>`);
      }
      const shape = this.factory.fromSvg(node.name, id, node.attributes, node.text);
      const children = node.children();
      if (children.length && !(shape instanceof ContainerShape)) throw new Error('children not allowed in ' + node.name);
      if (shape instanceof ContainerShape) children.forEach(child => shape.insertOwned(build(child)));
      return shape;
    };
    const document = new SvgDocument(width, height);
    root.children().forEach(child => document.add(build(child)));
    return { document, warnings };
  }
  private parse(source: string): XmlElement {
    const parser = new SaxesParser({ xmlns: false });
    const stack: XmlElement[] = [];
    let root: XmlElement | undefined;
    parser.on('error', error => { throw error; });
    parser.on('doctype', () => { throw new Error('DTD is not supported'); });
    parser.on('processinginstruction', () => { throw new Error('processing instructions are not supported'); });
    parser.on('opentag', tag => {
      const element = new XmlElement(tag.name, tag.attributes);
      const parent = stack.at(-1);
      if (parent) parent.append(element); else root = element;
      stack.push(element);
    });
    const append = (text: string): void => { stack.at(-1)?.appendText(text); };
    parser.on('text', append); parser.on('cdata', append);
    parser.on('closetag', () => { stack.pop(); });
    parser.write(source).close();
    if (!root) throw new Error('missing svg root');
    return root;
  }
}
