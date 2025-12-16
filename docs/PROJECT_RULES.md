# 项目管理规范

## 📁 文件组织规则

### 根目录文件规范

**只保留以下文件：**
- `README.md` - 项目主文档（简洁版，提供导航）
- `setup-copilot.sh` - 一键配置脚本
- `check-mcp-status.sh` - MCP 状态检查脚本
- `package.json`、`tsconfig.json` 等配置文件

**禁止在根目录放置：**
- ❌ 详细使用指南（应放在 `docs/` 目录）
- ❌ 开发文档（应放在 `docs/development/`）
- ❌ 变更日志（应放在 `docs/development/CHANGELOG.md`）
- ❌ 其他说明性 Markdown 文件

### docs/ 目录结构

```
docs/
├── getting-started/          # 新手入门文档
│   ├── QUICK_START.md       # 快速开始（5分钟上手）
│   └── MCP_AUTO_RELOAD.md   # MCP 配置生效指南
│
├── guides/                   # 使用指南
│   ├── AGENTS_GUIDE.md      # Custom Agents 详细说明
│   └── BEST_PRACTICES.md    # 最佳实践与规范
│
├── development/              # 开发参考文档
│   ├── STRUCTURE.md         # 项目结构详解
│   ├── TEST_GUIDE_v2.0.md   # 测试指南
│   └── CHANGELOG.md         # 版本更新历史
│
└── MCP_USAGE_DEMO.md        # 完整使用示例（独立文档）
```

### 文档分类原则

**getting-started/** - 新手必读
- 面向第一次使用的用户
- 提供最简单的上手步骤
- 解决常见的配置问题

**guides/** - 深入使用
- 面向已经配置好的用户
- 详细讲解功能特性
- 提供最佳实践建议

**development/** - 开发者参考
- 面向维护者和贡献者
- 技术细节和架构说明
- 测试和发布流程

## 📝 README.md 编写规范

### 内容要求

**必须包含：**
- ✅ 项目简介（1-2句话）
- ✅ 核心功能列表（3-5个要点）
- ✅ 项目结构概览（简化版）
- ✅ 快速开始步骤（3种方式）
- ✅ 配置说明（简要）
- ✅ 文档导航（分类清晰）
- ✅ 贡献指南和许可证

**禁止包含：**
- ❌ 详细的使用教程（应链接到 docs/）
- ❌ 完整的命令行示例（应链接到 QUICK_START）
- ❌ 详细的项目结构（应链接到 STRUCTURE）
- ❌ 冗长的背景介绍

### 长度控制

- **理想长度：** 200-300 行
- **最大长度：** 不超过 400 行
- **原则：** 能链接就不展开，保持简洁

## 🔄 文档维护规则

### 添加新文档时

1. **确定分类：** 判断属于 getting-started / guides / development
2. **放置文件：** 将 `.md` 文件放到对应目录
3. **更新 README：** 在 `📚 文档` 章节添加链接
4. **检查重复：** 避免内容与现有文档重复

### 更新现有文档时

1. **保持结构：** 不改变文档的分类位置
2. **更新日期：** 在文档底部标注更新日期
3. **同步 README：** 如果标题改变，更新 README 中的链接

### 删除文档时

1. **检查引用：** 搜索是否有其他文档引用
2. **更新链接：** 从 README 和其他文档中移除链接
3. **归档备份：** 可选择移到 `archive/` 目录而非直接删除

## 🎯 核心原则

1. **单一职责** - 每个文档只讲一个主题
2. **分层清晰** - 入门、进阶、开发三层分明
3. **避免重复** - 相同内容通过链接引用
4. **保持更新** - 及时清理过时内容
5. **用户优先** - 优先考虑用户的查找习惯
6. **强制 MCP** - 所有 Agent 和生成配置必须包含强制 MCP 工作流说明

## 🔧 Agent 编写强制规范

### 每个 Agent 必须包含的章节

**⚠️ 强制工作流** 章节（放在文档开头，核心原则之前）：

```markdown
## ⚠️ 强制工作流

**在编写任何代码前，必须先调用 MCP 工具：**

\`\`\`
get_relevant_standards({ fileType: "xxx" })
# 或
get_relevant_standards({ imports: ["xxx"] })
# 或
get_relevant_standards({ scenario: "xxx" })
\`\`\`
```

### 配置生成工具规范

`mcp-server/src/tools/generateConfig.ts` 必须在生成的配置文件中包含：

1. **⚠️ 强制工作流** 章节（在文档开头）
2. 根据项目类型列出常见的 MCP 调用场景
3. 标准流程：加载规范 → 理解需求 → 编写代码 → 验证规范

**参考实现：**
- [agents/vitasage.agent.md](../agents/vitasage.agent.md)
- [agents/vue3.agent.md](../agents/vue3.agent.md)
- [agents/i18n.agent.md](../agents/i18n.agent.md)

## 📅 维护周期

- **每月检查：** README 链接是否有效
- **版本发布时：** 更新 CHANGELOG.md
- **重大更新时：** 检查所有文档是否需要同步更新

---

**制定日期：** 2025-12-16  
**最后更新：** 2025-12-16  
**维护团队**: MTA工作室
