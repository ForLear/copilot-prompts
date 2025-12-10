# Copilot Prompts 可视化管理工具 - 快速开始

## 🎯 概述

`agent-manager.html` 是一个通用的可视化管理工具，帮助您轻松管理和应用 Copilot Prompts 到任何项目。

## ✨ 主要特性

- 📊 **可视化选择**: 直观的卡片式界面
- 🔍 **智能搜索**: 按名称/描述/标签快速查找
- 🏷️ **分类过滤**: Agents/Prompts/行业/框架/通用
- 📦 **一键生成**: 自动生成应用脚本
- 💡 **使用帮助**: 内置详细指南
- 📊 **实时统计**: 查看选择状态

## 🚀 使用流程

### 1. 打开管理界面

```bash
cd /path/to/copilot-prompts
open agent-manager.html
```

### 2. 选择 Prompts

#### 默认推荐（已预选）
- ✅ VitaSage Agent
- ✅ Vue 3 Agent
- ✅ TypeScript Agent
- ✅ i18n Agent

#### 按需添加
- 点击卡片上的复选框
- 使用搜索框查找特定 Prompt
- 通过侧边栏分类浏览

#### 快捷操作
- 全选: 点击 "☑️ 全选" 按钮
- 清空: 点击 "☐ 清空" 按钮
- 搜索: 在搜索框输入关键词

### 3. 生成配置脚本

点击 **"✅ 生成配置"** 按钮，系统会：
- 自动生成 `apply-prompts.sh` 脚本
- 下载到默认下载目录
- 弹出后续操作提示

### 4. 应用到项目

```bash
# 进入项目目录
cd your-project

# 复制下载的脚本
mv ~/Downloads/apply-prompts.sh ./

# 添加执行权限
chmod +x apply-prompts.sh

# 运行脚本
./apply-prompts.sh
```

**脚本会自动：**
- 检查 prompts 目录是否存在
- 合并选中的所有 Prompt 文件
- 生成 `.github/copilot-instructions.md`
- 备份旧配置文件
- 显示应用结果

### 5. 重新加载 VS Code

```
Cmd+Shift+P → 输入 "Reload Window" → 回车
```

## 📋 推荐配置方案

### 方案 1: Vue 3 前端项目

```
选择:
✅ Vue 3 Agent
✅ TypeScript Agent
✅ i18n Agent

适用于: 纯前端 Vue 3 项目
```

### 方案 2: VitaSage 工业项目

```
选择:
✅ VitaSage Agent (包含完整规范)
✅ TypeScript Agent
✅ i18n Agent

适用于: VitaSage 配方管理系统
```

### 方案 3: 全栈开发

```
选择:
✅ 所有 4 个 Agents
✅ Vue 3 + TypeScript Prompt
✅ i18n Prompt

适用于: 需要完整规范的大型项目
```

### 方案 4: 快速原型

```
选择:
✅ Vue 3 Agent

适用于: 快速开发，减少约束
```

## 🎨 界面说明

### 顶部工具栏
- **✅ 生成配置**: 生成并下载应用脚本
- **☑️ 全选**: 选择所有 Prompt
- **☐ 清空**: 清除所有选择
- **❓ 使用帮助**: 查看详细帮助
- **🔍 搜索框**: 实时搜索过滤

### 统计卡片
- **总计**: 所有可用的 Prompt 数量
- **已选择**: 当前选中的数量
- **Agents**: Agent 类型数量
- **Prompts**: Prompt 类型数量

### 侧边栏分类
- **全部**: 显示所有 Prompt
- **Agents**: 仅显示 Agent 配置
- **Prompts**: 仅显示通用 Prompt
- **行业专用**: 行业特定规范
- **Vue**: Vue 相关规范
- **通用规范**: 跨框架通用规范

### Prompt 卡片
- **标题**: Prompt 名称
- **路径**: 文件相对路径
- **类型标签**: Agent/Prompt
- **复选框**: 选择/取消选择
- **描述**: 详细说明
- **标签**: 相关技术栈

## 🔧 高级技巧

### 1. 搜索功能

```
搜索 "typescript" → 显示所有包含 TypeScript 的 Prompt
搜索 "vue3" → 显示 Vue 3 相关的 Prompt
搜索 "i18n" → 显示国际化相关的 Prompt
```

### 2. 分类浏览

点击侧边栏分类快速过滤：
- **Agents** → 查看所有 Custom Agents
- **Vue** → 查看 Vue 框架相关
- **通用规范** → 查看跨框架规范

### 3. 批量操作

- 全选 → 修改 → 生成配置
- 适用于需要大量 Prompt 的场景

### 4. 预览选择

在生成配置时，弹窗会显示：
- 已选择的 Prompt 列表
- 后续操作步骤
- 快速参考

## 📊 实际案例

### 案例 1: 新项目初始化

```bash
# 1. 打开管理器
open agent-manager.html

# 2. 选择基础 Agents（默认已选）
✅ Vue 3 Agent
✅ TypeScript Agent
✅ i18n Agent

# 3. 生成并应用
./apply-prompts.sh

# 4. 开始开发
# Copilot 会遵循选定的规范
```

### 案例 2: 切换项目规范

```bash
# 从通用 Vue 项目切换到 VitaSage 项目

# 1. 清空当前选择
点击 "清空"

# 2. 选择 VitaSage 配置
✅ VitaSage Agent
✅ TypeScript Agent
✅ i18n Agent

# 3. 重新生成配置
./apply-prompts.sh
```

### 案例 3: 多项目管理

```bash
# 为不同项目生成不同配置

# 项目 A (前端)
选择: Vue 3, TypeScript, i18n
生成: apply-prompts-frontend.sh

# 项目 B (VitaSage)
选择: VitaSage, TypeScript, i18n
生成: apply-prompts-vitasage.sh

# 分别应用到各自项目
```

## ❓ 常见问题

### Q1: 生成的脚本在哪里？
**A**: 在浏览器的默认下载目录（通常是 `~/Downloads/`）

### Q2: 如何更新现有配置？
**A**: 重新选择 Prompt，生成新脚本并运行即可，旧配置会自动备份

### Q3: 可以同时选择 Agent 和 Prompt 吗？
**A**: 可以！脚本会自动合并所有选中的内容

### Q4: 如何恢复备份？
**A**: 查看 `.github/copilot-instructions.md.backup.*` 文件，复制需要的版本

### Q5: 多个项目可以用同一个脚本吗？
**A**: 可以，只要 prompts 目录位置一致（相对路径 `../copilot-prompts`）

## 🔗 相关链接

- [copilot-prompts 仓库](https://github.com/ForLear/copilot-prompts)
- [最佳实践指南](./BEST_PRACTICES.md)
- [Agent 编写指南](./AGENTS_GUIDE.md)

## 💡 提示

- 默认选择通常适合大多数项目
- 选择越多，Copilot 上下文越丰富，但也可能更严格
- 快速原型可以只选择 1-2 个 Agent
- 生产项目建议选择所有相关规范

---

**开始使用可视化管理工具，轻松管理您的 Copilot 配置！** 🚀
