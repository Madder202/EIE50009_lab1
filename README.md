# EIE50009 Lab1

TypeScript 面向对象 CLI SVG 编辑器。当前支持 read、save、canvas、init、create（六种类型及 in）、move、scale、set、delete、group、ungroup、addto、front、back、undo、redo、tree、show、help。

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
CLI 输出结构树与属性；现在可保存 SVG 并用浏览器查看画布。架构与过程记录见 [doc/README.md](doc/README.md)。

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

## 结构编辑

- group G b a：按原文档顺序收编，而不是按输入顺序；跨父级放到最近公共祖先下。
- ungroup G：将子节点提升到 G 原先的位置；svg 直接子容器禁止解散。
- addto target item：把 item 放到 target 的最后；禁止自身或祖先移入后代。
- front item / back item：只改变同级顺序，分别放到末尾（视觉上层）/开头（视觉下层）。

每条结构编辑均支持一次 undo/redo 完整恢复。分组和移动归属保持几何与显式属性，继承样式随父级变化；解散容器不把容器样式复制到子图形。
[examples/structure.txt](examples/structure.txt) 包含独立完整案例、撤销重做及预期错误。

## SVG 保存、读回与预览

在 svg> 中输入：

```text
canvas
canvas 800 600
save examples/my-drawing.svg
read examples/my-drawing.svg
move scene 10 20
save
```

move 的目标应替换为你的实际 ID。将生成的 SVG 拖入 Edge/Chrome 查看；再次保存后刷新浏览器。可直接查看仓库内的 [examples/preview.svg](examples/preview.svg)，其生成脚本为 [examples/io.txt](examples/io.txt)。

save 无参数使用最近成功 read 的路径；init 后必须提供路径，显式 save 不重新绑定默认路径。路径含空格时使用双引号。成功 init/read/save/canvas 修改尺寸后 undo/redo 被禁止，下一次成功编辑才解除；canvas 无参数查询不影响历史。

read 对缺失或空 ID 自动分配标签名加序号，先预留所有显式 ID 避免冲突；成功后打印警告。支持六种内置元素、嵌套 g、公共样式、几何属性和 text 文本；根需要标准 SVG namespace、正数 width/height，viewBox 可缺省或与画布一致。transform、font-size、text-anchor、未知元素/属性、非匹配 viewBox、DTD 等超出当前确认范围，明确报错，不能读取任意 SVG 编辑器导出的文件。文件以 UTF-8 读写。

## 综合验收成果

已完成 45 项测试与原文案例回放，详见 [逐项验收记录](doc/acceptance/README.md)。

- [第 6 节 demo.svg](examples/acceptance/demo.svg) / [PNG 预览](doc/acceptance/demo.png)
- [第 6.1 节版本 A flowchart.svg](examples/acceptance/flowchart.svg) / [PNG 预览](doc/acceptance/flowchart.png)

测试会重新生成案例日志与预览；字体差异可能导致不同系统的 PNG 不完全相同。SVG 可直接在浏览器打开。
