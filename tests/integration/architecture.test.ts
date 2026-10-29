import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname, relative, basename } from 'node:path';
import ts from 'typescript';
test('production architecture: class files, encapsulation, permitted imports and dispatch audit',()=>{
 const files:string[]=[];
 const walk=(dir:string)=>{for(const item of readdirSync(dir,{withFileTypes:true})){const p=join(dir,item.name);if(item.isDirectory())walk(p);else if(p.endsWith('.ts'))files.push(p);}};walk('src');
 const allowed:Record<string,string[]>={ 'domain/model':['domain/model','domain/ports'],'domain/ports':['domain/model','domain/ports'],'domain/factory':['domain/factory','domain/model','domain/ports'],'application':['application','domain/model','domain/ports','domain/factory'],'presentation':['presentation','application','domain/model','domain/ports'],'infrastructure':['infrastructure','application','domain/model','domain/ports','domain/factory'],'bootstrap':['bootstrap','application','presentation','infrastructure','domain/factory','domain/model','domain/ports']};
 const layer=(path:string)=>{const parts=relative(resolve('src'),resolve(path)).replaceAll('\\','/').split('/');return parts[0]==='domain'?parts.slice(0,2).join('/'):parts[0]!;};
 for(const path of files){
  const source=readFileSync(path,'utf8');const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true);
  const classes=ast.statements.filter(ts.isClassDeclaration);assert.ok(classes.length<=1,path);
  for(const cls of classes){assert.equal(cls.name?.text,basename(path,'.ts'),path);for(const member of cls.members){if(ts.isPropertyDeclaration(member))assert.ok(ts.isPrivateIdentifier(member.name)||member.modifiers?.some(m=>m.kind===ts.SyntaxKind.PrivateKeyword||m.kind===ts.SyntaxKind.ProtectedKeyword),'public field: '+path);}}
  for(const node of ast.statements){if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)){
   const spec=node.moduleSpecifier.text;if(spec.startsWith('.'))assert.ok(allowed[layer(path)]!.includes(layer(resolve(dirname(path),spec))),`${path} -> ${spec}`);
   else assert.ok(['infrastructure','bootstrap'].includes(layer(path)),`${path} external import ${spec}`);
  }}
  assert.doesNotMatch(source,/\bswitch\s*\(/,path);
 }
 const doc=readFileSync('doc/README.md','utf8');const embedded=doc.match(/```plantuml\r?\n([\s\S]*?)```/)![1]!.trim();assert.equal(embedded,readFileSync('doc/architecture.puml','utf8').trim());
});
