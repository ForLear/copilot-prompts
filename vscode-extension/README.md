# Copilot Prompts Manager

🎨 可视化管理 GitHub Copilot Prompts 和 Agents 配置的 VS Code 插件

## ✨ 功能特性

- **📊 侧边栏视图**: 直观的树形结构显示所有可用配置
- **☑️ 复选框选择**: 点击即可选择/取消配置
- **⚡ 一键应用**: 自动生成并应用配置到当前项目
- **📦 配置模板**: 预设常用配置组合（Vue 3、VitaSage、全栈）
- **💾 状态持久化**: 自动保存选择状态
- **📊 状态栏指示**: 实时显示当前激活的配置数量
- **🔄 热更新**: 应用配置后无需重启 VS Code

## 🚀 快速开始

### 安装

1. 在 VS Code 扩展市场搜索 "Copilot Prompts Manager"
2. 点击安装

或者从 VSIX 文件安装：
```bash
code --install-extension copilot-prompts-manager-1.0.0.vsix
```

### 使用

1. **打开侧边栏**
   - 点击活动栏中的 Copilot Prompts 图标
   - 或使用命令面板: `Copilot Prompts: 打开配置管理器`

2. **选择配置**
   - 展开 "Agents" 或 "Prompts" 分类
   - 点击项目前的图标切换选择状态
   - 绿色✓表示已选中，空心圈表示未选中

3. **应用配置**
   - 点击顶部工具栏的 ✓ 图标
   - 或使用命令: `Copilot Prompts: 应用选中的配置`
   - 配置会自动生成到 `.github/copilot-instructions.md`

4. **使用模板**
   - 点击工具栏的文件夹图标
   - 选择预设模板快速配置

## 📋 可用配置

### Agents (4个)
- **VitaSage Agent**: 工业配方管理系统专用
- **Vue 3 Agent**: Vue 3 + TypeScript + Composition API
- **TypeScript Agent**: TypeScript 严格模式和类型安全
- **i18n Agent**: 国际化最佳实践

### Prompts (4个)
- **VitaSage 配方系统**: 完整开发规范
- **Vue 3 + TypeScript**: Composition API 最佳实践
- **TypeScript 严格模式**: 零 any、严格空检查
- **国际化 (i18n)**: 零硬编码文本

## 🎯 配置模板

### Vue 3 前端项目
```
✅ Vue 3 Agent
✅ TypeScript Agent
✅ i18n Agent
```

### VitaSage 工业项目
```
✅ VitaSage Agent
✅ TypeScript Agent
✅ i18n Agent
```

### 全栈项目
```
✅ 所有 4 个 Agents
```

## ⚙️ 设置

打开 VS Code 设置 (`Cmd+,`)，搜索 "Copilot Prompts":

- **Prompts Path**: Prompts 仓库的相对路径 (默认: `../copilot-prompts`)
- **Auto Apply**: 选择后自动应用配置 (默认: `false`)
- **Show Notifications**: 显示操作通知 (默认: `true`)

## 🔧 命令

所有命令都可以通过命令面板 (`Cmd+Shift+P`) 访问：

- `Copilot Prompts: 应用选中的配置` - 应用当前选择
- `Copilot Prompts: 刷新` - 刷新配置列表
- `Copilot Prompts: 全选` - 选择所有配置
- `Copilot Prompts: 清空选择` - 取消所有选择
- `Copilot Prompts: 查看当前配置` - 打开当前配置文件
- `Copilot Prompts: 打开配置管理器` - 打开 Webview 管理器
- `Copilot Prompts: 加载配置模板` - 选择预设模板

## 📊 工作流程

```mermaid
graph LR
    A[打开侧边栏] --> B[选择配置]
    B --> C[点击应用]
    C --> D[自动生成配置]
    D --> E[Copilot 使用新配置]
```

## 🔍 项目结构

应用配置后，项目会生成：

```
your-project/
├── .github/
│   ├── prompts/           # 符号链接到 copilot-prompts
│   └── copilot-instructions.md  # 生成的配置文件
```

## 💡 使用技巧

1. **状态栏**: 点击右下角的 "Copilot: X" 可以快速查看当前配置
2. **快捷键**: 可以为常用命令设置快捷键
3. **自动应用**: 开启 "Auto Apply" 后，选择配置会立即生效
4. **备份**: 每次应用配置都会自动备份旧文件

## 🐛 故障排除

### 配置未生效
1. 确认已点击"应用配置"按钮
2. 检查 `.github/copilot-instructions.md` 是否存在
3. 尝试重新加载 VS Code 窗口

### Prompts 目录未找到
1. 检查设置中的 "Prompts Path" 是否正确
2. 确保 copilot-prompts 仓库在正确位置
3. 插件会提示创建符号链接

### 权限问题
确保有权限写入 `.github` 目录

## 📖 了解更多

- [copilot-prompts 仓库](https://github.com/ForLear/copilot-prompts)
- [GitHub Copilot 文档](https://docs.github.com/en/copilot)
- [VS Code 插件开发](https://code.visualstudio.com/api)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

---

**享受更高效的 Copilot 配置管理！** 🚀
