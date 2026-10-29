# EIE50009 Lab1

TypeScript 面向对象 SVG 编辑器，当前完成领域模型阶段，尚无 CLI。

需要 Node.js 24 和 npm。在本目录运行：

```text
npm ci
npm test
npm run check
```

`npm test` 编译工程并运行领域测试。生成的 `dist/` 和依赖目录不提交。
架构、已确认语义和过程记录见 [doc/README.md](doc/README.md)。
当前实现画布、六种图形、容器层级、唯一 ID、基础几何/属性操作及内存快照；CLI、命令历史、分组命令和 SVG 文件 IO 待后续阶段完成。
