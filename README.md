# Copilot Prompts 中央仓库

集中管理各类项目的 AI 开发指令文件，用于 GitHub Copilot 和其他 AI 编程助手。

## 🎨 可视化管理工具 (新功能!)

```bash
# 打开可视化管理界面
open agent-manager.html
```

**功能特性:**
- ✅ 可视化选择 Agents 和 Prompts
- 🔍 搜索和分类过滤
- 📦 一键生成应用脚本
- 📊 实时统计信息
- 💡 使用帮助和指南

[查看详细使用指南 →](#-可视化管理工具使用)

## 📁 仓库结构

```
copilot-prompts/
├── agent-manager.html            # 🎨 可视化管理工具 (NEW!)
├── vue/
│   └── vue3-typescript.md        # Vue 3 + TypeScript 项目
├── common/
│   ├── typescript-strict.md      # TypeScript 严格模式
│   └── i18n.md                   # 国际化最佳实践
├── industry/
│   └── vitasage-recipe.md        # VitaSage 工业配方系统
└── agents/                        # VS Code Custom Agents
    ├── vitasage.agent.md         # VitaSage 专用
    ├── vue3.agent.md             # Vue 3 通用
    ├── typescript.agent.md       # TypeScript 严格模式
    └── i18n.agent.md             # 国际化
```

## 🚀 使用方式

### 🎨 方法 1: 可视化管理工具 (最推荐!)

```bash
# 1. 打开管理界面
cd /path/to/copilot-prompts
open agent-manager.html

# 2. 选择需要的 Agents 和 Prompts
#    - 勾选 Agent/Prompt 卡片
#    - 支持搜索和分类过滤

### 方法 3: Git Submodule (团队协作)
#    点击 "生成配置" 按钮

# 4. 应用到项目
cd your-project
mv ~/Downloads/apply-prompts.sh ./
chmod +x apply-prompts.sh
./apply-prompts.sh

# 5. 重新加载 VS Code
#    Cmd+Shift+P → "Reload Window"
```

**优点**: 
- ✅ 可视化选择，直观便捷
- ✅ 自动生成应用脚本
- ✅ 支持多项目复用
- ✅ 实时预览选择结果
**优点**: 版本化管理，团队统一规范

### 方法 4: 直接复制 (简单项目)
```bash
**优点**: 简单直接，但需要手动同步更新

### 方法 5: Custom Agents (VS Code 专用)prompts
ln -s prompts/vue/vue3-typescript.md .github/copilot-instructions.md
```

**优点**: 修改 prompts 立即生效，无需同步

### 方法 2: Git Submodule (团队协作，推荐)

```bash
# 在项目中添加为子模块
cd your-project
git submodule add https://github.com/ForLear/copilot-prompts.git .github/prompts

# 创建符号链接到具体 prompt
ln -s prompts/vue/vue3-typescript.md .github/copilot-instructions.md

# 团队成员初次克隆后需要初始化子模块
git submodule update --init

# 更新到最新版本
cd .github/prompts
git pull origin main
```

**优点**: 版本化管理，团队统一规范

### 方法 3: 直接复制 (简单项目)

**优点**: 简单直接，但需要手动同步更新

### 方法 4: Custom Agents (VS Code 专用，推荐)

```bash
# 一键同步所有 agents 到项目
cd /path/to/copilot-prompts
./sync-agents.sh /path/to/your-project

# 或手动复制
cp agents/*.agent.md your-project/.github/agents/
```

**使用方式**:
```
# 在 VS Code Copilot Chat 中
@vitasage 创建一个 CRUD 页面
@vue3 生成一个表单组件
@typescript 定义 API 响应类型
@i18n 重构这段代码使其支持国际化
```

**优点**: 
- ✅ 精准的上下文控制
- ✅ 按需选择规范
- ✅ 便于团队协作
- ✅ 一键更新维护

---

## 🎨 可视化管理工具使用

### 快速开始

1. **打开管理界面**
   ```bash
   open agent-manager.html
   ```

2. **选择 Prompts**
   - 默认已选中推荐的 4 个 Agents
   - 点击卡片上的复选框添加/移除
   - 使用搜索框快速查找
   - 通过侧边栏按分类浏览

3. **生成配置**
   - 点击 "生成配置" 按钮
   - 自动下载 `apply-prompts.sh` 脚本

4. **应用到项目**
   ```bash
   # 复制脚本到项目
   mv ~/Downloads/apply-prompts.sh your-project/
   cd your-project
   
   # 添加执行权限
   chmod +x apply-prompts.sh
   
   # 运行脚本
   ./apply-prompts.sh
   
   # 重新加载 VS Code
   # Cmd+Shift+P → "Reload Window"
   ```

### 界面功能

- **统计卡片**: 显示总计/已选择/Agents/Prompts 数量
- **分类筛选**: 全部/Agents/Prompts/行业/Vue/通用
- **搜索功能**: 按名称/描述/标签搜索
- **批量操作**: 全选/清空按钮
- **使用帮助**: 详细的使用说明

### 推荐配置

**Vue 3 前端项目:**
```
✅ Vue 3 Agent
✅ TypeScript Agent
✅ i18n Agent
```

**VitaSage 工业项目:**
```
✅ VitaSage Agent (包含完整规范)
✅ TypeScript Agent
✅ i18n Agent
```

**全栈项目:**
```
✅ 所有 4 个 Agents
✅ 相关 Prompts (按需)

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

- **🎨 可视化管理工具指南**: [MANAGER_GUIDE.md](./MANAGER_GUIDE.md) - 详细使用教程和案例
- **最佳实践指南**: [BEST_PRACTICES.md](./BEST_PRACTICES.md) - 详细的使用方案对比和建议
- **Agent 编写指南**: [AGENTS_GUIDE.md](./AGENTS_GUIDE.md) - 如何编写自定义 Agent
- **配置完成说明**: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - 初次设置指南
- [GitHub Copilot 文档](https://docs.github.com/en/copilot)
- [VS Code MCP 指南](https://aka.ms/vscode-instructions-docs)
