# EIE50009 Lab1

TypeScript 面向对象 CLI SVG 编辑器。当前支持 init、create（六种类型及 in）、move、scale、set、delete、undo、redo、tree、show、help。

## 启动

需要 Node.js 24 和 npm。在本项目目录运行：

```powershell
npm ci
npm run cli
```

已有依赖时直接 npm run cli 即可。启动会自动编译，出现 `svg>` 后逐行输入：

```text
init 800 600
create g scene
create rect panel 20.5 30 160 60 #ffffff in scene
create text title 35 65 "你好 SVG 编辑器" in scene
tree
show title
help
```

命令中的颜色不需要引号；包含空格的文本使用双引号。仅整行开头（可带前导空白）的 # 表示注释。退出可按 Ctrl+C；Windows 终端也可用 Ctrl+Z 后回车发送 EOF。

## 脚本回放与验证

[examples/intro.txt](examples/intro.txt) 提供完整体验脚本，包含故意重复 ID 的错误和随后状态检查。在 PowerShell 中回放：

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content examples/intro.txt -Encoding utf8 | npm run cli
```

```text
npm test
npm run check
```

npm test 编译并运行领域和 CLI 集成测试。dist/ 和 node_modules/ 不提交。
本阶段输出结构树与属性，不显示图形画布；save/read 及 group/ungroup/addto/front/back CLI 命令尚未接入。架构与过程记录见 [doc/README.md](doc/README.md)。

## 编辑与撤销体验

启动 npm run cli 后可继续输入：

```text
move scene 30 10
scale scene 2
tree
undo
tree
redo
set title text "修改后的标题"
delete scene
tree
undo
tree
```

scale 同时缩放位置与尺寸，stroke-width 不变。一次编辑对应一次撤销，create 也可撤销；查询不入栈。undo 后成功的新编辑清空 redo，失败命令保留历史。成功 init 清空历史并设置屏障，直到下一条成功编辑解除；屏障期间 undo/redo 报错。

[examples/history.txt](examples/history.txt) 是独立完整的编辑回放脚本，可像 intro.txt 一样通过 PowerShell 管道运行。该脚本包含预期失败的 scale 0 和清空历史分支后的 redo。
