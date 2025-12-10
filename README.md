# Copilot Prompts 中央仓库

集中管理各类项目的 AI 开发指令文件，用于 GitHub Copilot 和其他 AI 编程助手。

## 📁 仓库结构

```
copilot-prompts/
├── vue/
│   ├── vue3-typescript.md        # Vue 3 + TypeScript 项目
│   ├── vue3-composition-api.md   # Composition API 最佳实践
│   └── element-plus.md           # Element Plus UI 组件规范
├── react/
│   ├── react-typescript.md       # React + TypeScript
│   └── nextjs.md                 # Next.js 项目
├── backend/
│   ├── nodejs-express.md         # Node.js + Express
│   └── nestjs.md                 # NestJS 框架
├── common/
│   ├── typescript-strict.md      # TypeScript 严格模式
│   ├── api-design.md             # RESTful API 设计
│   ├── error-handling.md         # 错误处理规范
│   └── i18n.md                   # 国际化最佳实践
└── industry/
    ├── vitasage-recipe.md        # VitaSage 工业配方系统
    └── fintech-payment.md        # 金融支付系统
```

## 🚀 使用方式

### 方法 1: 直接复制到项目

```bash
# 复制特定 prompt 到项目
cp copilot-prompts/vue/vue3-typescript.md your-project/.github/copilot-instructions.md
```

### 方法 2: Git Submodule (推荐)

```bash
# 在项目中添加为子模块
cd your-project
git submodule add https://github.com/ForLear/copilot-prompts.git .github/prompts

# 创建符号链接
ln -s prompts/vue/vue3-typescript.md .github/copilot-instructions.md
```

### 方法 3: MCP 集成 (VS Code)

在 VS Code 的 MCP 配置中引用：

```json
{
  "mcpServers": {
    "github": {
      "prompts": {
        "vue3": "github:ForLear/copilot-prompts/vue/vue3-typescript.md",
        "vitasage": "github:ForLear/copilot-prompts/industry/vitasage-recipe.md"
      }
    }
  }
}
```

## 📝 prompt 编写规范

每个 prompt 文件应包含：

1. **项目定位** - 简述技术栈和应用场景
2. **核心原则** - 3-5 条最重要的开发原则
3. **关键架构模式** - 项目特有的架构模式和约定
4. **禁止模式** - 明确不允许的代码模式
5. **代码审查清单** - 可执行的检查项
6. **参考示例** - 指向代码库中的实际文件

## 🔄 更新策略

- 每次项目重构后同步更新对应的 prompt
- 新项目类型创建新的分类目录
- 定期 review 已有 prompts 的有效性

## 📚 相关资源

- [GitHub Copilot 文档](https://docs.github.com/en/copilot)
- [VS Code MCP 指南](https://aka.ms/vscode-instructions-docs)
