import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SvgCodec } from '../../src/infrastructure/SvgCodec.js';
import { NodeDocumentStore } from '../../src/infrastructure/NodeDocumentStore.js';
import { EditorSession } from '../../src/application/EditorSession.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { ShapeFactory } from '../../src/domain/factory/ShapeFactory.js';
import { TextDocumentDisplay } from '../../src/presentation/TextDocumentDisplay.js';
import { Repl } from '../../src/presentation/Repl.js';
const svg=(body:string,extra='')=>`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" ${extra}>${body}</svg>`;
const setup=()=>{
 const session=new EditorSession(new NodeDocumentStore(),new SvgCodec());
 const repl=new Repl(new CommandDispatcher(new ShapeFactory(),new TextDocumentDisplay()),session);
 const run=(line:string)=>{const result=repl.evaluate(line)!;assert.doesNotMatch(result,/^error:/,line);return result;};
 const snap=()=>JSON.stringify([session.document().width,session.document().height,session.document().tree()]);
 return {session,repl,run,snap};
};
test('auto IDs reserve future explicit IDs, report warnings and count groups',()=>{
 const codec=new SvgCodec();const {document,warnings}=codec.decode(svg('<rect/><g><rect/><text>中文 &amp; test</text></g><rect id="rect1"/><g id="g1"/>'));
 assert.deepEqual(warnings,['warning: assigned id rect2 to unnamed <rect>','warning: assigned id g2 to unnamed <g>','warning: assigned id rect3 to unnamed <rect>','warning: assigned id text1 to unnamed <text>']);
 assert.equal(document.size,6);assert.equal(document.parentId('rect3'),'g2');assert.equal(document.describe('text1').text,'中文 & test');
 assert.throws(()=>codec.decode(svg('<rect id="x"/><circle id="x"/>')),/id already exists: x/);
});
test('codec roundtrip preserves all six types, ordering, styles, text and whitespace',()=>{
 const {session,run}=setup();run('init 400 300');
 for(const line of ['create g g','create rect r 1.5 -2 30 40 in g','create circle c 1 2 3 red in g','create ellipse e 1 2 3 4 in g','create line l 1 2 3 4 black','create text t 1 2 "中文 & < >" in g','set g fill blue','set r stroke-width 2'])run(line);
 session.document().setAttribute('t','text',' \t<&>"\'中文😀\r\n ');
 session.document().setAttribute('r','fill','a&"<>\t\n');
 const codec=new SvgCodec(),source=codec.encode(session.document());
 assert.match(source,/&amp;/);assert.match(source,/&lt;/);assert.match(source,/&quot;/);assert.match(source,/&#13;/);
 const decoded=codec.decode(source);assert.deepEqual(decoded.document.tree(),session.document().tree());assert.deepEqual(decoded.warnings,[]);
 assert.equal(decoded.document.width,400);assert.equal(decoded.document.height,300);
 assert.equal(decoded.document.parentId('t'),'g');
});
test('malformed or unsupported SVG is rejected instead of silently dropping data',()=>{
 const codec=new SvgCodec();
 for(const source of [svg('<rect transform="translate(1,2)"/>'),svg('<path/>'),svg('<text font-size="12">x</text>'),svg('<text><g/></text>'),svg('<g xmlns="wrong"/>'),svg('<rect width="10px"/>'),svg('<rect/>','viewBox="1 0 400 300"'),svg('<g>'),svg('<rect id="a" id="b"/>'),'<!DOCTYPE svg>'+svg(''),svg('<svg/>'),svg('<text text="not-content"/>'),svg('<rect/>')+svg('')])assert.throws(()=>codec.decode(source),source);
 assert.equal(codec.decode(svg('<!-- comment --><text id="t"><![CDATA[<&中文]]></text>')).document.describe('t').text,'<&中文');
});
test('save read roundtrip with spaced path, default read path and explicit save does not rebind',()=>{
 const dir=mkdtempSync(join(process.cwd(),'.io-test-'));
 try {
  const {session,repl,run,snap}=setup();const path=join(dir,'中文 drawing.svg'),other=join(dir,'copy.svg');
  run('init');run('create g g');run('create rect r 1 2 3 4 in g');const before=snap();
  run(`save "${path}"`);assert.equal(repl.evaluate('undo'),'error: undo not allowed after io command');
  assert.equal(repl.evaluate('save'),'error: no default path. use save <file.svg>');
  run(`read "${path}"`);assert.equal(snap(),before);run('move r 1 0');run(`save "${other}"`);run('move r 1 0');run('save');
  assert.equal(new SvgCodec().decode(readFileSync(path,'utf8')).document.describe('r').attributes.x,'3');
  assert.equal(new SvgCodec().decode(readFileSync(other,'utf8')).document.describe('r').attributes.x,'2');
  assert.equal(session.document().parentId('r'),'g');run('init');assert.equal(repl.evaluate('save'),'error: no default path. use save <file.svg>');
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('read/write failures preserve full state, default path and redo; no warning on failed import',()=>{
 const dir=mkdtempSync(join(process.cwd(),'.io-test-'));
 try {
  const {repl,run,snap}=setup();const valid=join(dir,'valid.svg'),bad=join(dir,'bad.svg'),missing=join(dir,'missing.svg'),blocked=join(dir,'directory');
  writeFileSync(valid,svg('<rect id="r" x="1"/>'));writeFileSync(bad,svg('<rect/><path/>'));mkdirSync(blocked);
  run(`read "${valid}"`);run('move r 2 3');const after=snap();run('undo');const before=snap();
  assert.equal(repl.evaluate(`read "${missing}"`),'error: cannot read file: '+missing);
  assert.match(repl.evaluate(`read "${bad}"`)!,/^error: invalid SVG:/);assert.doesNotMatch(repl.evaluate(`read "${bad}"`)!,/warning:/);
  assert.equal(repl.evaluate(`save "${blocked}"`),'error: cannot write file: '+blocked);
  assert.equal(snap(),before);assert.deepEqual(readdirSync(dir).sort(),['bad.svg','directory','valid.svg']);
  run('redo');assert.equal(snap(),after);run('save');assert.equal(new SvgCodec().decode(readFileSync(valid,'utf8')).document.describe('r').attributes.x,'3');
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('canvas query preserves redo while successful resize sets barrier; failures preserve history',()=>{
 const {repl,run,snap}=setup();run('init');run('create rect r 1 2 3 4');run('move r 1 0');const after=snap();run('undo');
 assert.equal(run('canvas'),'canvas 800x600');assert.equal(repl.evaluate('canvas 10'),'error: usage: canvas [w h]');assert.match(repl.evaluate('canvas -1 20')!,/^error:/);
 run('redo');assert.equal(snap(),after);run('canvas 400.5 300');assert.equal(run('canvas'),'canvas 400.5x300');
 assert.equal(repl.evaluate('undo'),'error: undo not allowed after io command');assert.equal(repl.evaluate('redo'),'error: undo not allowed after io command');
 run('move r 1 0');run('undo');assert.equal(run('canvas'),'canvas 400.5x300');assert.equal(repl.evaluate('undo'),'error: nothing to undo');
});
test('read works before init; successful read and save block both undo and redo',()=>{
 const dir=mkdtempSync(join(process.cwd(),'.io-test-'));
 try {
  const {repl,run}=setup();const path=join(dir,'auto.svg');writeFileSync(path,svg('<rect/>'));
  assert.match(run(`read "${path}"`),/^warning: assigned id rect1/);
  for(const command of ['undo','redo'])assert.equal(repl.evaluate(command),'error: undo not allowed after io command');
  run('move rect1 1 0');run('save');for(const command of ['undo','redo'])assert.equal(repl.evaluate(command),'error: undo not allowed after io command');
  run('move rect1 1 0');run('undo');assert.equal(repl.evaluate('undo'),'error: nothing to undo');
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('save encoding failure preserves original file, document and redo',()=>{
 const dir=mkdtempSync(join(process.cwd(),'.io-test-'));
 try {
  const {session,repl,run,snap}=setup();const path=join(dir,'preserved.svg');writeFileSync(path,'original');
  run('init');run('create text t 1 2 "ok"');session.document().setAttribute('t','text','bad\u0000');run('move t 1 0');const after=snap();run('undo');const before=snap();
  assert.equal(repl.evaluate(`save "${path}"`),'error: invalid XML character');assert.equal(readFileSync(path,'utf8'),'original');assert.equal(snap(),before);run('redo');assert.equal(snap(),after);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
