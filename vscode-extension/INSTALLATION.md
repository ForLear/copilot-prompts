# Copilot Prompts Manager - 安装和使用指南

## ✅ 开发完成清单

- [x] 扩展项目结构创建
- [x] package.json 配置（命令、视图、菜单）
- [x] TypeScript 核心代码（extension.ts、promptsProvider.ts、configManager.ts）
- [x] README.md 文档
- [x] SVG 图标
- [x] 调试配置（launch.json、tasks.json）
- [x] 依赖安装（302 包）
- [x] TypeScript 编译成功

## 🚀 下一步：测试扩展

### 方法1：开发模式测试

1. **在 VS Code 中打开扩展目录**
   ```bash
   cd /Users/pailasi/Work/copilot-prompts/vscode-extension
   code .
   ```

2. **按 F5 启动调试**
   - 会打开新的 VS Code 窗口（Extension Development Host）
   - 在新窗口中测试扩展功能

3. **测试功能**
   - ✓ 侧边栏显示 Copilot Prompts 视图
   - ✓ 点击项目切换选择状态
   - ✓ 工具栏按钮可用
   - ✓ 命令面板中找到所有命令
   - ✓ 状态栏显示配置数量

### 方法2：打包安装测试

1. **安装打包工具**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **打包扩展**
   ```bash
   cd /Users/pailasi/Work/copilot-prompts/vscode-extension
   vsce package
   ```
   生成文件: `copilot-prompts-manager-1.0.0.vsix`

3. **安装到 VS Code**
   ```bash
   code --install-extension copilot-prompts-manager-1.0.0.vsix
   ```

4. **重新加载 VS Code**
   - 命令面板 → "Developer: Reload Window"

## 🎯 使用流程

### 1. 打开扩展
- 点击活动栏左侧的 Copilot Prompts 图标
- 或命令面板: `Copilot Prompts: 打开配置管理器`

### 2. 选择配置
- **Agents** (默认全选)
  - ✓ VitaSage Agent
  - ✓ Vue 3 Agent
  - ✓ TypeScript Agent
  - ✓ i18n Agent

- **Prompts** (可选)
  - VitaSage 配方系统
  - Vue 3 + TypeScript
  - TypeScript 严格模式
  - 国际化 (i18n)

### 3. 应用配置
- 点击顶部工具栏的 ✓ 图标
- 或右键菜单 → "应用选中的配置"
- 或命令面板 → `Copilot Prompts: 应用选中的配置`

### 4. 验证
检查生成的文件：
```bash
cat .github/copilot-instructions.md
```

## 🔧 配置调整

### 修改 prompts 路径
如果 copilot-prompts 不在父目录：

1. 打开设置: `Cmd + ,`
2. 搜索: "Copilot Prompts Path"
3. 修改为实际路径，如: `../../other/copilot-prompts`

### 启用自动应用
1. 设置 → "Copilot Prompts: Auto Apply" → 勾选
2. 现在选择配置会立即应用

## 🛠️ 开发调试

### 实时编译
```bash
npm run watch
```

### 修改代码后
1. 在 Extension Development Host 窗口中
2. 命令面板 → "Developer: Reload Window"
3. 或按 `Cmd + R`

### 查看日志
- 命令面板 → "Developer: Toggle Developer Tools"
- Console 标签查看日志

## 📦 发布到市场

### 前置条件
1. 注册 [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. 创建 Personal Access Token

### 登录
```bash
vsce login <publisher>
```

### 发布
```bash
vsce publish
```

### 或增量发布
```bash
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0
```

## 🎨 自定义

### 添加新配置
编辑 `src/configManager.ts` 的 `prompts` 数组：

```typescript
{
  id: 'new-prompt',
  type: 'prompt',
  category: 'Prompts',
  title: '新配置标题',
  description: '配置描述',
  path: 'path/to/prompt.md',
  tags: ['tag1', 'tag2'],
  default: false  // true=默认选中
}
```

### 修改图标
替换 `media/icon.svg`，尺寸建议: 128x128

### 自定义命令
在 `package.json` 的 `contributes.commands` 中添加

## 🐛 常见问题

### Q: 扩展无法加载
A: 检查 `out/` 目录是否存在编译后的 JS 文件

### Q: 命令不显示
A: 确认 `package.json` 中的 `activationEvents` 正确

### Q: 配置未应用
A: 检查控制台错误信息，确认文件写入权限

### Q: 图标不显示
A: 确保 `media/icon.svg` 存在且格式正确

## 📊 项目结构

```
vscode-extension/
├── package.json          # 扩展清单
├── tsconfig.json         # TypeScript 配置
├── README.md             # 用户文档
├── INSTALLATION.md       # 本文件
├── .vscode/
│   ├── launch.json       # 调试配置
│   └── tasks.json        # 构建任务
├── src/
│   ├── extension.ts      # 入口文件
│   ├── promptsProvider.ts  # TreeView 提供者
│   └── configManager.ts  # 配置管理
├── media/
│   └── icon.svg          # 扩展图标
└── out/                  # 编译输出
    ├── extension.js
    ├── promptsProvider.js
    └── configManager.js
```

## 🎉 测试清单

- [ ] F5 启动扩展开发窗口
- [ ] 侧边栏显示 Copilot Prompts
- [ ] 树形结构正确（Agents + Prompts）
- [ ] 点击项目切换选择状态
- [ ] "应用配置"生成 .github/copilot-instructions.md
- [ ] 状态栏显示 "Copilot: 4" (默认选中数量)
- [ ] "全选"/"清空选择" 按钮工作
- [ ] "刷新" 按钮更新视图
- [ ] "加载模板" 显示选择对话框
- [ ] "查看当前配置" 打开生成的文件
- [ ] "打开配置管理器" 显示 Webview 面板

---

**准备就绪！按 F5 开始测试** 🚀
