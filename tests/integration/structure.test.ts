import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EditorSession } from '../../src/application/EditorSession.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { ShapeFactory } from '../../src/domain/factory/ShapeFactory.js';
import { TextDocumentDisplay } from '../../src/presentation/TextDocumentDisplay.js';
import { Repl } from '../../src/presentation/Repl.js';
const setup = (lines: readonly string[]) => {
 const session=new EditorSession();const repl=new Repl(new CommandDispatcher(new ShapeFactory(),new TextDocumentDisplay()),session);
 const run=(line:string)=>{const output=repl.evaluate(line)!;assert.doesNotMatch(output,/^error:/,line);return output;};
 run('init');lines.forEach(run);
 const snapshot=()=>JSON.stringify([session.document().width,session.document().height,session.document().tree()]);
 const ids=(parent?:string)=>(parent?session.document().describe(parent).children:session.document().tree()).map(c=>c.id);
 const roundtrip=(line:string)=>{const before=snapshot();run(line);const after=snapshot();run('undo');assert.equal(snapshot(),before);run('redo');assert.equal(snapshot(),after);};
 return {session,repl,run,snapshot,ids,roundtrip};
};
test('same-parent group ignores argument order and replaces earliest selected position',()=>{
 const {session,ids,roundtrip}=setup(['create g root',...['a','b','c','d'].map(id=>`create circle ${id} 1 2 3 in root`)]);
 roundtrip('group pair d b');assert.deepEqual(ids('root'),['a','pair','c']);assert.deepEqual(ids('pair'),['b','d']);
 assert.equal(session.document().parentId('pair'),'root');assert.equal(session.document().parentId('d'),'pair');
});
test('cross-parent grouping uses nearest common ancestor and original depth-first order',()=>{
 const {session,ids,roundtrip}=setup(['create g outer','create g A in outer','create g B in outer','create circle a 1 2 3 in A','create circle x 1 2 3 in A','create circle b 1 2 3 in B','create circle y 1 2 3 in B']);
 roundtrip('group G b a');assert.deepEqual(ids('outer'),['G','A','B']);assert.deepEqual(ids('G'),['a','b']);assert.deepEqual(ids('A'),['x']);assert.deepEqual(ids('B'),['y']);
 assert.equal(session.document().parentId('G'),'outer');
});
test('cross-root mixed direct and deep targets retain unselected branches',()=>{
 const {ids,session,roundtrip}=setup(['create circle first 0 0 1','create g A','create g deep in A','create circle a 0 0 1 in deep','create circle last 0 0 1']);
 roundtrip('group G last a');assert.deepEqual(ids(),['first','G','A']);assert.deepEqual(ids('G'),['a','last']);assert.deepEqual(ids('deep'),[]);assert.equal(session.document().parentId('G'),null);
});
test('ungroup promotes children exactly into original slot; empty group can be dissolved',()=>{
 const {session,ids,roundtrip,run}=setup(['create g root','create circle before 1 2 3 in root','create g inner in root','create circle a 1 2 3 in inner','create g nested in inner','create text t 1 2 "中文" in nested','create circle after 1 2 3 in root','set inner fill red']);
 roundtrip('ungroup inner');assert.deepEqual(ids('root'),['before','a','nested','after']);assert.equal(session.document().has('inner'),false);assert.equal(session.document().parentId('nested'),'root');assert.equal(session.document().parentId('t'),'nested');
 run('create g empty in root');roundtrip('ungroup empty');assert.equal(session.document().has('empty'),false);
});
test('addto moves a subtree as last child and same-parent addto appends',()=>{
 const {session,ids,roundtrip}=setup(['create g A','create g B','create g inner in A','create circle c 1 2 3 in inner','create circle x 1 2 3 in B','create circle y 1 2 3 in B']);
 roundtrip('addto B inner');assert.deepEqual(ids('A'),[]);assert.deepEqual(ids('B'),['x','y','inner']);assert.equal(session.document().parentId('c'),'inner');
 roundtrip('addto B x');assert.deepEqual(ids('B'),['y','inner','x']);
});
test('front/back only reorder siblings and emit in visual stacking order',()=>{
 const {session,ids,roundtrip}=setup(['create g root','create g a in root','create circle child 1 2 3 in a','create circle b 1 2 3 in root','create circle c 1 2 3 in root','create g other']);
 roundtrip('front a');assert.deepEqual(ids('root'),['b','c','a']);assert.deepEqual(ids(),['root','other']);
 roundtrip('back c');assert.deepEqual(ids('root'),['c','b','a']);
 roundtrip('front root');assert.deepEqual(ids(),['other','root']);
 const emitted:string[]=[];session.document().emit({begin:(_tag,attrs)=>{if(attrs.id)emitted.push(attrs.id);},text:()=>{},end:()=>{}});
 assert.deepEqual(emitted,['other','root','c','b','a','child']);
});
test('invalid grouping, root ungroup and cycles preserve full state and redo',()=>{
 const {repl,run,snapshot}=setup(['create g root','create g child in root','create circle r 1 2 3 in child','create circle s 1 2 3 in root']);
 run('move r 10 20');const moved=snapshot();run('undo');const before=snapshot();
 const cases=[['group bad child r','cannot group a container into its own descendant: child'],['group bad r root','cannot group a container into its own descendant: root'],['group bad r r','duplicate group target'],['group root r s','id already exists: root'],['group bad r missing','no such shape: missing'],['ungroup root','cannot ungroup top-level container: root'],['ungroup r','not a container: r'],['addto child root','cannot create containment cycle'],['addto root root','cannot create containment cycle'],['addto r s','not a container: r'],['front missing','no such shape: missing'],['back missing','no such shape: missing']];
 for(const [line,message] of cases){assert.equal(repl.evaluate(line!),'error: '+message);assert.equal(snapshot(),before);}
 for(const line of ['group only r','ungroup','addto root','front r extra','back']){assert.match(repl.evaluate(line)!,/^error: usage:/);assert.equal(snapshot(),before);}
 run('redo');assert.equal(snapshot(),moved);
});
test('each structural edit is one history unit; all successful commands clear redo',()=>{
 const {run,repl,snapshot}=setup(['create g root','create circle a 1 2 3 in root','create circle b 1 2 3 in root','create g empty in root']);
 for(const command of ['group G b a','ungroup empty','addto root a','front a','back b']){
  const before=snapshot();run(command);const after=snapshot();run('undo');assert.equal(snapshot(),before);run('redo');assert.equal(snapshot(),after);run('undo');
  run(command);assert.equal(repl.evaluate('redo'),'error: nothing to redo');run('undo');assert.equal(snapshot(),before);
 }
});
