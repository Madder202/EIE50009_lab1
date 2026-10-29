import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { EditorSession } from '../../src/application/EditorSession.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { ShapeFactory } from '../../src/domain/factory/ShapeFactory.js';
import { TextDocumentDisplay } from '../../src/presentation/TextDocumentDisplay.js';
import { CommandLineParser } from '../../src/presentation/CommandLineParser.js';
import { Repl } from '../../src/presentation/Repl.js';
const setup = () => {
 const session = new EditorSession();
 return { session, repl: new Repl(new CommandDispatcher(new ShapeFactory(),new TextDocumentDisplay()),session) };
};
test('quoted text, escapes, ordinary Windows slashes and colors survive tokenization',()=>{
 const p=new CommandLineParser();
 assert.deepEqual(p.parse('  # comment'),[]);
 assert.equal(p.parse('create rect r 1 2 3 4 #ffffff').at(-1)!.value,'#ffffff');
 assert.equal(p.parse('""')[0]!.value,'');
 assert.equal(p.parse('"中文 hello"')[0]!.value,'中文 hello');
 assert.equal(p.parse(String.raw`"C:\demo\file.svg"`)[0]!.value,String.raw`C:\demo\file.svg`);
 assert.equal(p.parse(String.raw`"say \"hi\""`)[0]!.value,'say "hi"');
 assert.throws(()=>p.parse('"unfinished'),/unterminated/);
 assert.throws(()=>p.parse('"text"suffix'),/whitespace/);
});
test('help works before init and nested creates show geometry and parent',()=>{
 const {session,repl}=setup();
 assert.match(repl.evaluate('help')!,/create <type>/);
 assert.equal(repl.evaluate('tree'),"error: no document. use 'init' or 'read' first");
 assert.equal(repl.evaluate('init'),'canvas 800x600 created');
 assert.equal(repl.evaluate('create g scene'),'g#scene created');
 assert.equal(repl.evaluate('create g node in scene'),'g#node created in g#scene');
 assert.equal(repl.evaluate('create rect r 1.5 -2 30 40 #ffffff in node'),'rect#r created in g#node');
 assert.equal(repl.evaluate('create text t 2 3 "开始 hello" in node'),'text#t created in g#node');
 assert.match(repl.evaluate('tree')!,/rect#r  x=1.5 y=-2 width=30 height=40 fill=#ffffff/);
 assert.match(repl.evaluate('show t')!,/parent=g#node/);
 assert.match(repl.evaluate('tree node')!,/^g#node/);
 assert.equal(repl.evaluate('tree r'),'rect#r  x=1.5 y=-2 width=30 height=40 fill=#ffffff');
 assert.equal(session.document().size,4);
});
test('all six factory types, optional style and quoted in text',()=>{
 const {session,repl}=setup();repl.evaluate('init 400.5');
 assert.equal(session.document().height,600);
 for(const line of ['create g g','create rect r 1 2 3 4','create circle c 1 2 3 red','create ellipse e 1 2 3 4','create line l 1 2 3 4 black','create text t 1 2 "in"','create text empty 0 0 ""']) {
  assert.doesNotMatch(repl.evaluate(line)!,/^error:/);
 }
 assert.equal(session.document().describe('t').text,'in');
 assert.equal(session.document().describe('r').attributes.fill,undefined);
 assert.equal(session.document().describe('l').attributes.stroke,'black');
 assert.equal(session.document().describe('empty').text,'');
});
test('every failed command preserves document and REPL recovers',()=>{
 const {session,repl}=setup();repl.evaluate('init');repl.evaluate('create rect r 0 0 10 10');
 const before=JSON.stringify(session.document().tree());
 const failures=[['create rect r 0 0 1 1','id already exists: r'],['create g x in absent','no such container: absent'],['create g x in r','not a container: r'],['create box b','unknown shape type: box (is the plugin loaded?)'],['init 1 -2','dimension must be positive'],['show absent','no such shape: absent'],['create text t 1 2 "bad','unterminated double quote'],['create circle c 1 2 nope','invalid number: nope'],['create rect new 1 2 3 4 #ffffff # trailing','invalid parameters for Rectangle'],['tree r extra','usage: tree [id]'],['unknown','unknown command: unknown']];
 for(const [line,message] of failures) {
  assert.equal(repl.evaluate(line!), 'error: '+message);
  assert.equal(JSON.stringify(session.document().tree()),before);
  assert.equal(session.document().width,800);
 }
 assert.equal(repl.evaluate('  # ignored'),undefined);assert.equal(repl.evaluate(''),undefined);
 assert.equal(repl.evaluate('create g ok'),'g#ok created');
});
test('real process prints prompt, errors, Chinese, and exits on EOF',()=>{
 const result=spawnSync(process.execPath,['dist/src/bootstrap/Main.js'],{input:'help\ninit\ncreate text t 1 2 "开始 hello"\nshow t\nbogus\ntree\n',encoding:'utf8'});
 assert.equal(result.status,0);assert.equal(result.stderr,'');
 assert.match(result.stdout,/svg> /);assert.match(result.stdout,/text#t created/);
 assert.match(result.stdout,/开始 hello/);assert.match(result.stdout,/error: unknown command: bogus/);
 assert.match(result.stdout,/svg \(800x600\)/);
});
