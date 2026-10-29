import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SvgDocument } from '../../src/domain/model/SvgDocument.js';
import { Rectangle } from '../../src/domain/model/Rectangle.js';
import { Circle } from '../../src/domain/model/Circle.js';
import { Ellipse } from '../../src/domain/model/Ellipse.js';
import { Line } from '../../src/domain/model/Line.js';
import { TextShape } from '../../src/domain/model/TextShape.js';
import { Group } from '../../src/domain/model/Group.js';
import { Canvas } from '../../src/domain/model/Canvas.js';
import { DocumentMemento } from '../../src/domain/model/DocumentMemento.js';
import type { Shape } from '../../src/domain/model/Shape.js';
const snapshot = (d: SvgDocument) => JSON.stringify([d.width, d.height, d.tree()]);

test('canvas dimension validation is atomic', () => {
 const d = new SvgDocument(); assert.equal(d.width, 800); assert.equal(d.height, 600);
 assert.throws(() => d.resize(100, 0)); assert.equal(d.width, 800);
 d.resize(300.5, 200); assert.equal(d.width, 300.5);
 assert.throws(() => new Canvas(Infinity, 1));
});
test('all six types support polymorphic operations and independent cloning', () => {
 const shapes: Shape[] = [new Rectangle('r',1,2,3,4),new Circle('c',1,2,3),new Ellipse('e',1,2,3,4),new Line('l',1,2,3,4),new TextShape('t',1,2,'开始'),new Group('g')];
 for (const s of shapes) {
  s.move(2,3); s.scale(2); s.setAttribute('fill','red');
  assert.equal(s.describe().attributes.fill,'red'); assert.equal(s.describe().attributes.stroke,undefined);
  assert.deepEqual(s.clone().describe(),s.describe());
  assert.throws(() => s.setAttribute('id','new'),/unknown attribute/);
  assert.throws(() => s.scale(0),/scale factor must be positive/);
 }
 assert.deepEqual(shapes[0]!.describe().attributes,{x:'6',y:'10',width:'6',height:'8',fill:'red'});
 assert.deepEqual(shapes[3]!.describe().attributes,{x1:'6',y1:'10',x2:'10',y2:'14',fill:'red'});
 assert.equal(shapes[4]!.describe().text,'开始');
});
test('nested transforms update lookup indexes and preserve parent links', () => {
 const d=new SvgDocument(); d.add(new Group('a'));d.add(new Group('b'),'a');d.add(new Rectangle('r',1,2,3,4),'b');
 d.move('a',10,20);d.scale('a',2);assert.equal(d.describe('r').attributes.x,'22');
 d.move('r',1,0);assert.equal(d.describe('r').attributes.x,'23');
 assert.equal(d.parentId('r'),'b');assert.equal(d.parentId('a'),null);
 d.setAttribute('a','fill','red');assert.equal(d.describe('r').attributes.fill,undefined);
 assert.throws(()=>d.setAttribute('a','x','1'),/unknown attribute/);
});
test('duplicate IDs include descendants and remain case sensitive', () => {
 const d=new SvgDocument();d.add(new Circle('r',0,0,1));d.add(new Circle('R',0,0,1));
 const before=snapshot(d);const g=new Group('g');g.insertOwned(new Circle('r',0,0,1));
 assert.throws(()=>d.add(g),/id already exists: r/);assert.equal(snapshot(d),before);assert.equal(d.has('g'),false);
 const bad=new Group('bad');bad.insertOwned(new Group('dup'));bad.insertOwned(new Group('dup'));
 assert.throws(()=>d.add(bad),/id already exists: dup/);assert.equal(snapshot(d),before);
});
test('reparent keeps one parent and rejects cycles without mutation', () => {
 const d=new SvgDocument();d.add(new Group('a'));d.add(new Group('b'),'a');d.add(new Rectangle('r',0,0,1,1),'a');
 d.addTo('b','r');assert.equal(d.parentId('r'),'b');assert.deepEqual(d.describe('a').children.map(c=>c.id),['b']);
 const before=snapshot(d);
 assert.throws(()=>d.addTo('b','a'),/cycle/);assert.throws(()=>d.addTo('a','a'),/cycle/);
 assert.throws(()=>d.addTo('r','a'),/not a container/);assert.throws(()=>d.add(new Group('new'),'missing'),/no such container/);
 assert.equal(snapshot(d),before);d.delete('b');assert.equal(d.has('r'),false);assert.equal(d.size,1);
 d.add(new Circle('r',0,0,1));assert.equal(d.parentId('r'),null);
});
test('overflow after first child and invalid attributes leave full state unchanged', () => {
 const d=new SvgDocument();d.add(new Group('g'));d.add(new Rectangle('r',1,1,1,1),'g');d.add(new Circle('big',Number.MAX_VALUE,0,1),'g');
 const before=snapshot(d);assert.throws(()=>d.scale('g',2),/finite/);assert.equal(snapshot(d),before);
 assert.throws(()=>d.setAttribute('r','width','-1'));assert.throws(()=>d.setAttribute('r','x',''));assert.throws(()=>d.move('g',Infinity,1));assert.equal(snapshot(d),before);
});
test('document input, query and memento boundaries prevent mutable aliasing', () => {
 const r=new Rectangle('r',1,2,3,4);const d=new SvgDocument();d.add(r);r.move(100,100);assert.equal(d.describe('r').attributes.x,'1');
 const view=d.describe('r');assert.throws(()=>{(view.attributes as Record<string,string>).x='100';},TypeError);
 const m=new DocumentMemento(d);d.move('r',10,10);const restored=m.restore();restored.move('r',20,20);
 assert.equal(m.restore().describe('r').attributes.x,'1');assert.equal(d.describe('r').attributes.x,'11');
});
test('containers reject identity cycles; canvas is not a graph element', () => {
 const a=new Group('a'),b=new Group('b');a.insertOwned(b);assert.throws(()=>b.insertOwned(a),/cycle/);assert.throws(()=>a.insertOwned(a),/cycle/);
 const d=new SvgDocument();assert.throws(()=>d.describe('$canvas'),/no such shape/);assert.throws(()=>d.add(new Canvas()),/cannot add canvas/);
});
test('polymorphic emission preserves nesting and text without tag dispatch', () => {
 const d=new SvgDocument(10,20);d.add(new Group('g'));d.add(new TextShape('t',1,2,'<&中文'),'g');const events:unknown[]=[];
 d.emit({begin:(tag,attrs)=>events.push([tag,attrs]),text:value=>events.push(value),end:tag=>events.push('/'+tag)});
 assert.deepEqual(events,[['svg',{xmlns:'http://www.w3.org/2000/svg',width:'10',height:'20',viewBox:'0 0 10 20'}],['g',{id:'g'}],['text',{id:'t',x:'1',y:'2'}],'<&中文','/text','/g','/svg']);
});

test('one object cannot be attached to two containers; detaching transfers ownership', () => {
 const a=new Group('a'),b=new Group('b'),r=new Rectangle('r',1,2,3,4);
 a.insertOwned(r);assert.throws(()=>b.insertOwned(r),/already attached/);
 b.insertOwned(a.removeOwned('r'));assert.equal(a.describe().children.length,0);assert.equal(b.describe().children[0]!.id,'r');
});
test('same-parent reparent appends and descendant styles stay explicit', () => {
 const d=new SvgDocument();d.add(new Group('g'));d.add(new Circle('a',1,2,3),'g');d.add(new Circle('b',4,5,6),'g');
 d.addTo('g','a');assert.deepEqual(d.describe('g').children.map(c=>c.id),['b','a']);
 d.setAttribute('a','fill','blue');d.setAttribute('a','stroke-width','2');d.setAttribute('g','fill','red');d.scale('g',2);
 assert.equal(d.describe('a').attributes.fill,'blue');assert.equal(d.describe('a').attributes['stroke-width'],'2');
});
