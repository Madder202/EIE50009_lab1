import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EditorSession } from '../../src/application/EditorSession.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { ShapeFactory } from '../../src/domain/factory/ShapeFactory.js';
import { TextDocumentDisplay } from '../../src/presentation/TextDocumentDisplay.js';
import { Repl } from '../../src/presentation/Repl.js';
import { EditCommand } from '../../src/application/commands/EditCommand.js';
import type { SvgDocument } from '../../src/domain/model/SvgDocument.js';
const setup = () => {
 const session=new EditorSession(); const repl=new Repl(new CommandDispatcher(new ShapeFactory(),new TextDocumentDisplay()),session);
 const run=(line:string) => { const result=repl.evaluate(line)!;assert.doesNotMatch(result,/^error:/,line);return result; };
 run('init');return {session,repl,run,snapshot:()=>JSON.stringify([session.document().width,session.document().height,session.document().tree()])};
};
test('recursive move and scale change positions and dimensions; history restores exact values',()=>{
 const {session,run,snapshot}=setup();
 for(const line of ['create g outer','create g inner in outer','create rect r 0.1 0.2 3 4 in inner','create circle c 5 6 7 in inner','create ellipse e 1 2 3 4 in outer','create line l 1 2 3 4 in outer','create text t 1 2 "中文" in inner'])run(line);
 const before=snapshot();run('move outer 10 20');const moved=snapshot();run('scale outer 2');const scaled=snapshot();
 assert.deepEqual(session.document().describe('r').attributes,{x:'20.2',y:'40.4',width:'6',height:'8'});
 assert.deepEqual(session.document().describe('e').attributes,{cx:'22',cy:'44',rx:'6',ry:'8'});
 assert.deepEqual(session.document().describe('l').attributes,{x1:'22',y1:'44',x2:'26',y2:'48'});
 assert.equal(session.document().describe('c').attributes.r,'14');assert.equal(session.document().describe('t').attributes.y,'44');
 run('undo');assert.equal(snapshot(),moved);run('undo');assert.equal(snapshot(),before);
 run('redo');run('redo');assert.equal(snapshot(),scaled);
 for(let i=0;i<10;i++){run('undo');run('redo');assert.equal(snapshot(),scaled);}
});
test('delete restores full nested subtree, attributes, IDs, parents and sibling order',()=>{
 const {session,run,snapshot}=setup();
 for(const line of ['create g scene','create circle before 1 2 3 in scene','create g middle in scene','create g nested in middle','create text t 1 2 "a b" in nested','set middle fill red','set t stroke-width 2','create circle after 1 2 3 in scene'])run(line);
 const before=snapshot();run('delete middle');const deleted=snapshot();assert.equal(session.document().has('t'),false);
 run('undo');assert.equal(snapshot(),before);assert.equal(session.document().parentId('t'),'nested');
 assert.deepEqual(session.document().describe('scene').children.map(c=>c.id),['before','middle','after']);
 run('redo');assert.equal(snapshot(),deleted);run('undo');run('set t text "restored and editable"');
 assert.equal(session.document().describe('t').text,'restored and editable');
});
test('set whitelist and inherited style restore exactly, including missing attributes',()=>{
 const {session,repl,run,snapshot}=setup();run('create g g');run('create rect r 1 2 3 4 in g');
 const initial=snapshot();run('set g fill red');assert.equal(session.document().describe('r').attributes.fill,undefined);
 run('set r width 10.5');run('set r stroke-width 2');run('scale g 3');assert.equal(session.document().describe('r').attributes['stroke-width'],'2');
 const before=snapshot();for(const line of ['set r cx 2','set g x 2','set r text bad','set r id renamed','set r width -1','set r stroke-width -1'])assert.match(repl.evaluate(line)!,/^error:/);
 assert.equal(snapshot(),before);run('undo');run('undo');run('undo');run('undo');assert.equal(snapshot(),initial);
});
test('new edit including create/no-op clears redo but failures and queries preserve it',()=>{
 const {repl,run,snapshot}=setup();run('create rect r 1 2 3 4');run('move r 2 3');const after=snapshot();run('undo');const before=snapshot();
 for(const line of ['scale r 0','scale r -1','move r NaN 0','delete missing','create rect r 0 0 1 1','set r unknown value','redo extra','init -1 600'])assert.match(repl.evaluate(line)!,/^error:/);
 run('tree');run('show r');run('help');repl.evaluate('# comment');repl.evaluate('');assert.equal(snapshot(),before);
 run('redo');assert.equal(snapshot(),after);run('undo');run('create g new');assert.equal(repl.evaluate('redo'),'error: nothing to redo');
 run('undo');run('move r 0 0');assert.equal(repl.evaluate('redo'),'error: nothing to redo');run('undo');assert.equal(snapshot(),before);
});
test('init barrier persists through failed edits and queries, then successful editing unlocks it',()=>{
 const {repl,run}=setup();assert.equal(repl.evaluate('undo'),'error: undo not allowed after io command');
 assert.equal(repl.evaluate('redo'),'error: undo not allowed after io command');
 assert.match(repl.evaluate('move absent 1 1')!,/^error:/);run('tree');
 assert.equal(repl.evaluate('undo'),'error: undo not allowed after io command');
 run('create g a');run('undo');assert.equal(repl.evaluate('undo'),'error: nothing to undo');run('redo');
 run('init 200 300');assert.equal(repl.evaluate('redo'),'error: undo not allowed after io command');run('create g b');run('undo');assert.equal(repl.evaluate('undo'),'error: nothing to undo');
});
test('overflow failure preserves redo and existing undo entry',()=>{
 const {repl,run,snapshot}=setup();run('create g g');run('create rect r 1 2 3 4 in g');run('create circle huge 1e308 0 1 in g');run('set r fill red');const after=snapshot();run('undo');const before=snapshot();
 assert.match(repl.evaluate('scale g 10')!,/^error: number must be finite/);assert.equal(snapshot(),before);
 run('redo');assert.equal(snapshot(),after);run('undo');run('undo');assert.doesNotMatch(run('tree'),/circle#huge/);
});
test('application transaction discards mutations if a command throws after changing candidate',()=>{
 const {session,run,snapshot}=setup();run('create rect r 1 2 3 4');run('move r 5 6');const after=snapshot();run('undo');const before=snapshot();
 class FailingCommand extends EditCommand {
  override apply(document:SvgDocument):string { document.move('r',100,100);throw new Error('injected failure'); }
 }
 assert.throws(()=>session.executeEdit(new FailingCommand()),/injected failure/);assert.equal(snapshot(),before);
 run('redo');assert.equal(snapshot(),after);
});
test('create undo and redo preserve insertion order and clear history when exhausted',()=>{
 const {session,repl,run,snapshot}=setup();run('create g g');run('create circle a 1 2 3 in g');run('create circle b 1 2 3 in g');const full=snapshot();
 run('undo');assert.equal(session.document().has('b'),false);run('redo');assert.equal(snapshot(),full);
 run('undo');run('undo');run('undo');assert.equal(session.document().size,0);assert.equal(repl.evaluate('undo'),'error: nothing to undo');
 run('redo');run('redo');run('redo');assert.equal(snapshot(),full);assert.equal(repl.evaluate('redo'),'error: nothing to redo');
});
