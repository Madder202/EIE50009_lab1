import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Resvg } from '@resvg/resvg-js';
import { SvgCodec } from '../../src/infrastructure/SvgCodec.js';
import { EditorSession } from '../../src/application/EditorSession.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { ShapeFactory } from '../../src/domain/factory/ShapeFactory.js';
import { TextDocumentDisplay } from '../../src/presentation/TextDocumentDisplay.js';
import { Repl } from '../../src/presentation/Repl.js';
const setup=()=>{const session=new EditorSession();const repl=new Repl(new CommandDispatcher(new ShapeFactory(),new TextDocumentDisplay()),session);return {session,repl};};
test('original sections 6 and 6.1 A replay through actual CLI with semantic assertions',()=>{
 const cwd=resolve('examples/acceptance');mkdirSync('doc/acceptance',{recursive:true});
 for(const name of ['section6','section6_1a']){
  const input=readFileSync(resolve(cwd,name+'.txt'),'utf8');
  const result=spawnSync(process.execPath,[resolve('dist/src/bootstrap/Main.js')],{cwd,input,encoding:'utf8'});
  assert.equal(result.status,0);assert.equal(result.stderr,'');
  writeFileSync('doc/acceptance/'+name+'.log',result.stdout.split(/\r?\n/).map(line=>line.trimEnd()).join('\n').trim()+'\n');
  const errors=result.stdout.match(/error:[^\r\n]+/g)??[];
  assert.deepEqual(errors,name==='section6'?['error: cannot group a container into its own descendant: markers','error: undo not allowed after io command']:[]);
  if(name==='section6'){
   assert.match(result.stdout,/saved to demo.svg \(5 elements\)/);assert.match(result.stdout,/warning: assigned id rect1 to unnamed <rect>/);assert.match(result.stdout,/read other.svg \(7 elements\)/);
  }else assert.match(result.stdout,/saved to flowchart.svg \(8 elements\)/);
 }
 const codec=new SvgCodec();const demo=codec.decode(readFileSync(resolve(cwd,'demo.svg'),'utf8')).document;
 assert.equal(demo.describe('c1').attributes.cx,'130');assert.equal(demo.describe('title').text,'My Diagram');assert.equal(demo.parentId('box'),'markers');assert.deepEqual(demo.describe('markers').children.map(c=>c.id),['c1','box']);
 const flow=codec.decode(readFileSync(resolve(cwd,'flowchart.svg'),'utf8')).document;
 assert.equal(flow.describe('process').attributes.y,'100');assert.equal(flow.describe('process-label').attributes.y,'135');assert.equal(flow.describe('process-label').text,'处理数据 v2');assert.equal(flow.size,8);
 for(const name of ['demo','flowchart']){
  const svg=readFileSync(resolve(cwd,name+'.svg'),'utf8');
  const rendered=new Resvg(svg,{background:'white',font:{loadSystemFonts:true,defaultFontFamily:'Microsoft YaHei'}}).render();
  assert.equal(rendered.width,800);assert.equal(rendered.height,600);
  writeFileSync('doc/acceptance/'+name+'.png',rendered.asPng());
 }
});
test('all geometry whitelist entries edit and undo; foreign attributes rejected for every type',()=>{
 const {session,repl}=setup();repl.evaluate('init');
 const cases:[string,string[]][]=[['rect r 1 2 3 4',['x','y','width','height']],['circle c 1 2 3',['cx','cy','r']],['ellipse e 1 2 3 4',['cx','cy','rx','ry']],['line l 1 2 3 4',['x1','y1','x2','y2']],['text t 1 2 "test"',['x','y','text']],['g g',[]]];
 for(const [spec,geometry] of cases){
  assert.doesNotMatch(repl.evaluate('create '+spec)!,/^error:/);const id=spec.split(' ')[1]!;
  for(const attr of [...geometry,'fill','stroke','stroke-width']){
   const before=JSON.stringify(session.document().tree());const value=attr==='text'?'"中文 new"':attr==='fill'||attr==='stroke'?'red':'7.5';
   assert.doesNotMatch(repl.evaluate(`set ${id} ${attr} ${value}`)!,/^error:/);repl.evaluate('undo');assert.equal(JSON.stringify(session.document().tree()),before);
  }
  for(const attr of ['id','transform','font-size','label','unknown'])assert.equal(repl.evaluate(`set ${id} ${attr} 2`),'error: unknown attribute: '+attr);
 }
});
test('all document-dependent commands reject missing document; help lists all 19 commands',()=>{
 const {repl}=setup();
 for(const command of ['save x.svg','canvas','create g a','delete a','move a 1 2','scale a 2','set a fill red','group g a b','ungroup g','addto g a','front a','back a','tree','show a','undo','redo'])assert.equal(repl.evaluate(command),"error: no document. use 'init' or 'read' first",command);
 const help=repl.evaluate('help')!;
 for(const command of ['init','read','save','canvas','create','delete','move','scale','set','group','ungroup','addto','front','back','tree','show','help','undo','redo'])assert.match(help,new RegExp('  '+command+'(?: |\\n|$)'));
});
test('session query snapshots cannot mutate current document or bypass its history',()=>{
 const {session,repl}=setup();repl.evaluate('init');repl.evaluate('create g g');repl.evaluate('create circle c 1 2 3 in g');
 const before=JSON.stringify(session.document().tree());const query=session.document();query.delete('g');query.resize(1,1);
 assert.equal(JSON.stringify(session.document().tree()),before);assert.equal(session.document().width,800);
 repl.evaluate('undo');assert.equal(session.document().has('c'),false);repl.evaluate('redo');assert.equal(JSON.stringify(session.document().tree()),before);
});
