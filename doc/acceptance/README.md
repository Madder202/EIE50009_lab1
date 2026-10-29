# Phase 1 验收记录

日期：2026-10-29。范围为原始 phase_cli_1.md 的 Phase 1，加用户确认的 D01—D15。box/插件与版本 B 不在范围内。结果：45 项测试通过；19 个命令均已实现。验收不是“支持任意 SVG”的承诺。

## 指定会话回放

- 第 6 节：[输入](../../examples/acceptance/section6.txt)、[实际输出](section6.log)、[SVG](../../examples/acceptance/demo.svg)、[渲染图](demo.png)。只出现原文预期的祖先后代分组错误和保存后撤销错误；读 other.svg 后分配 rect1，计数 7。保存的 demo.svg 计数 5，c1 的 cx=130、标题恢复 My Diagram、box 恢复至 markers 且顺序正确。
- 第 6.1 节版本 A：[输入](../../examples/acceptance/section6_1a.txt)、[实际输出](section6_1a.log)、[SVG](../../examples/acceptance/flowchart.svg)、[渲染图](flowchart.png)。无错误，8 个元素；process 的 y=100、标签 y=135，内容为“处理数据 v2”。
- 输入命令由原文 svg> 行直接提取，未改变命令顺序或参数；回放 cwd 为 examples/acceptance，文件名 demo.svg、other.svg、flowchart.svg 保持原文不变。
- 使用 resvg 生成 800×600 PNG 并人工看图：典型会话的标题、红圆和蓝矩形正常；流程图的蓝/橙节点、连线、中文标签正常，未出现文字缺字或节点移动残留。预览使用 Microsoft YaHei 字体；SVG 自身未强加字号/字体，浏览器字体可能不同。没有将本地渲染检查称为浏览器截图检查。
- 成功摘要采用 moved by、undone/redone 等明确反馈，tree 使用完整 width/height 名；与原文示例排版不逐字相同，符合先前确认的 D13。固定错误文本按要求检查。

## 逐项验收矩阵

所有路径以项目根目录为基准；测试位于 tests/domain/model.test.ts、tests/integration/*.test.ts。

| 项 | 结果 | 实际证据 |
|---|---|---|
| A01 REPL/解析 | 通过 | cli：真实进程、提示符、EOF、双引号、颜色、中文、注释；acceptance 两会话 |
| A02 文档/尺寸 | 通过 | model、io、acceptance：默认尺寸、正尺寸、canvas 查询/修改、未初始化错误 |
| A03 六类型/create in | 通过 | cli、model、acceptance：全部类型参数、嵌套容器、缺省样式 |
| A04 ID/类型/容器错误 | 通过 | model、cli：大小写 ID、重复 ID、无容器/非容器、未知 box |
| A05 move/scale | 通过 | history：所有几何位置与尺寸、递归变换、浮点精确恢复 |
| A06 set 白名单 | 通过 | acceptance：逐类型遍历每个几何/文本及公共属性；跨类型非法属性；history：样式恢复 |
| A07 delete | 通过 | history：删除整子树后恢复 ID、父级、属性、顺序 |
| A08 group | 通过 | structure：同父级非连续节点、参数逆序、最近公共祖先、混合根级目标、重复与祖先冲突 |
| A09 ungroup | 通过 | structure：原槽位提升、空容器、根级拒绝 |
| A10 addto | 通过 | structure/model：最后插入、同父级、自包含/循环、多父级约束 |
| A11 z-order | 通过 | structure：同级顺序、根级容器、emit 输出顺序 |
| A12 undo/redo | 通过 | history/structure：每种编辑单单元、完整快照、redo 清空、空栈 |
| A13 文档历史屏障 | 通过 | history/io：init/read/save/canvas 修改均禁撤销；查询和失败不影响历史 |
| A14 失败原子性 | 通过 | history/io/structure：完整文档/redo、默认路径、写失败、候选文档故障注入 |
| A15 tree/show/help | 通过 | cli/acceptance：几何、子树、父级、19 命令完整列表 |
| A16 read | 通过（确认子集） | io：预扫描补 ID、警告、重复 ID、XML 格式/范围拒绝 |
| A17 save | 通过 | io：显式/默认路径、另存不绑定、中文/实体/空白、文件替换失败、临时文件清理 |
| A18 读写往返 | 通过 | io：六类型属性、文本、顺序、尺寸和父级；回放读回后继续编辑 |
| A19 指定案例 | 通过 | acceptance：两段真实进程回放、SVG 语义断言、PNG 看图 |
| A20 TypeScript/OO | 通过 | npm test 编译；architecture：同名类文件、非公开字段、模块依赖；人工抽查多态 |
| A21 模式/依赖 | 通过 | architecture 自动检查及 doc/README.md 一致性自查，命令/工厂两处分派 |
| A22 文档 | 通过 | README.md 架构、PlantUML 源、过程、修订、自查和 QA 已更新；图源与内嵌代码一致 |
| A23 最终交付 | 待完成 | 已有分阶段本地 Git 历史；本轮不推送、不打 final 标签，截止时间未提供 |

## 修复与限制

发现 EditorSession.document 返回当前可变文档，可绕过 Command/History 修改状态。改为返回独立副本，并新增修改查询副本不影响当前会话及 undo/redo 的回归测试。原先通过该方法准备特殊字符的 IO 测试改为修改独立编码样本或通过 set 命令准备数据。

保留已确认的限制：不支持 transform、任意 SVG 属性或插件；help 在无文档时可用；历史用完整快照且嵌套操作有重复复制；同步文件 IO 会阻塞处理当前行；更换父级影响 SVG 样式继承。文件覆盖测试不等于断电恢复保证。PlantUML 源已一致性检查，未额外渲染成图片。

## 重现

```text
npm ci
npm test
npm run check
```

npm test 会重新回放原文脚本并更新本目录日志/PNG、examples/acceptance 下输出 SVG；不同系统字体可能导致 PNG 字节变化。可独立运行构建后的验收：

```text
node --test dist/tests/integration/acceptance.test.js dist/tests/integration/architecture.test.js
```
