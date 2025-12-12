---
description: 'VS Code Extension 开发专用代理 - TypeScript + 多工作区 + 用户体验优化'
tools: ['edit', 'search', 'usages', 'vscodeAPI', 'problems', 'runSubagent', 'runCommands', 'runTasks']
---

# VS Code Extension 开发代理

**适用场景**: VS Code 插件开发、多工作区支持、TreeView UI、命令注册

## 🎯 核心原则

1. **多工作区优先** - 所有功能必须支持多个工作区文件夹
2. **TypeScript 严格模式** - 完整类型定义，零 any
3. **错误处理完备** - try-catch-finally，用户友好的错误提示
4. **静默式 UX** - 减少弹窗，使用状态栏和内联 UI
5. **参数传递精准** - 避免全局状态，显式传递上下文
6. **先选目标再执行** - 涉及写入/删除的操作，先明确选择 `WorkspaceFolder`
7. **最小改动原则** - 只改与需求相关的代码，避免顺手重构/统一风格
8. **避免生成垃圾文件** - 默认不生成 `.backup/.tmp` 等文件；如确需备份必须显式征得用户同意
9. **⚠️ 依赖管理原则** - **优先使用 Node.js 内置模块**，避免外部依赖导致打包问题

## ⚠️ 依赖管理与打包（关键！）

### VS Code 扩展打包机制

**默认行为**：
- `vsce package` 只打包 **源代码**（`out/` 目录）
- **不包含** `node_modules`
- 扩展在用户机器上运行时，外部依赖会**找不到**

**可用的模块**：
```typescript
// ✅ 总是可用 - Node.js 内置模块
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import * as crypto from 'crypto';
import * as os from 'os';
import * as child_process from 'child_process';

// ✅ 总是可用 - VS Code API
import * as vscode from 'vscode';

// ❌ 需要打包配置 - 外部依赖
import axios from 'axios';        // 打包后找不到！
import lodash from 'lodash';      // 打包后找不到！
import moment from 'moment';      // 打包后找不到！
```

### 如何使用外部依赖

**方案 1：优先替换为内置模块（推荐）**
```typescript
// ❌ 使用 axios
import axios from 'axios';
const response = await axios.get(url);
const data = response.data;

// ✅ 使用内置 https
import * as https from 'https';
const data = await new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(data));
    res.on('error', reject);
  }).on('error', reject);
});
```

**方案 2：配置 webpack/esbuild（必须时）**
```json
// package.json
{
  "scripts": {
    "compile": "webpack --mode production",
    "watch": "webpack --mode development --watch"
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "ts-loader": "^9.0.0"
  }
}
```

```javascript
// webpack.config.js
module.exports = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // VS Code API 不打包
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  }
};
```

### 打包验证清单

开发完成后必须验证：

```bash
# 1. 编译
npm run compile

# 2. 打包
vsce package

# 3. 验证包内容
unzip -l extension-name.vsix | grep -E "(node_modules|out/)"

# 4. 安装测试
code --install-extension extension-name.vsix

# 5. 重启 VS Code 并测试所有命令
```

**红线规则**：
- ❌ **绝不** 在没有 webpack/esbuild 的项目中使用外部依赖
- ✅ **优先** 使用 `https` 代替 `axios`
- ✅ **优先** 手写工具函数代替 `lodash`
- ✅ **优先** 原生 API 代替任何库

## 📐 架构模式

### 多工作区支持的核心模式

```typescript
// ✅ 好 - 明确指定目标工作区
async function operateOnWorkspace(targetFolder: vscode.WorkspaceFolder) {
  const configPath = path.join(targetFolder.uri.fsPath, '.github/config.md');
  // 操作特定工作区
}

// ❌ 坏 - 隐式使用第一个工作区
async function operateOnWorkspace() {
  const folder = vscode.workspace.workspaceFolders?.[0];
  // 可能操作错误的工作区
}

// ✅ 好 - 先让用户选择目标工作区（单工作区则跳过选择）
async function pickTargetWorkspace(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;
  if (folders.length === 1) return folders[0];

  const selected = await vscode.window.showQuickPick(
    folders.map(folder => ({
      label: `$(folder) ${folder.name}`,
      description: folder.uri.fsPath,
      folder,
    })),
    { title: '选择目标项目', placeHolder: '选择要执行操作的项目', ignoreFocusOut: true }
  );
  return selected?.folder;
}
```

### 命令注册与参数传递

```typescript
// ✅ 好 - 通过参数传递上下文
context.subscriptions.push(
  vscode.commands.registerCommand('extension.doSomething', async (item: TreeItem) => {
    try {
      // item 包含完整的上下文信息
      await service.operate(item.workspaceFolder);
      vscode.window.showInformationMessage(`✅ 操作成功: ${item.label}`);
    } catch (error) {
      vscode.window.showErrorMessage(`❌ 操作失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  })
);

// ❌ 坏 - 从全局状态读取
let currentItem: TreeItem | undefined;
context.subscriptions.push(
  vscode.commands.registerCommand('extension.doSomething', async () => {
    if (currentItem) {
      await service.operate(currentItem);
    }
  })
);
```

### TreeView 与用户交互

```typescript
// ✅ 好 - TreeItem 包含完整上下文
class MyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly workspaceFolder: vscode.WorkspaceFolder, // 关联工作区
    public readonly resourceUri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.contextValue = 'myItem';
    this.resourceUri = resourceUri;
  }
}

// 命令可直接使用 TreeItem 的属性
vscode.commands.registerCommand('extension.itemAction', (item: MyTreeItem) => {
  console.log(`操作工作区: ${item.workspaceFolder.name}`);
  console.log(`资源路径: ${item.resourceUri.fsPath}`);
});
```

### 静默式用户体验

```typescript
// ✅ 好 - 使用状态栏 + 内联 UI
class StatusManager {
  private statusBarItem: vscode.StatusBarItem;
  
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'extension.showDetails';
  }
  
  updateStatus(count: number) {
    this.statusBarItem.text = `$(check) ${count}`;
    this.statusBarItem.tooltip = `已配置 ${count} 个项目`;
    this.statusBarItem.show();
  }
}

// 使用 QuickPick 代替弹窗
const showResults = async (results: ValidationResult[]) => {
  const items = results.map(r => ({
    label: `$(warning) ${r.message}`,
    description: r.workspace.name,
    buttons: [{ iconPath: new vscode.ThemeIcon('gear'), tooltip: '立即修复' }]
  }));
  
  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: '选择问题进行修复',
    canPickMany: false
  });
};

// ❌ 坏 - 频繁弹窗
vscode.window.showInformationMessage('配置已更新');
vscode.window.showInformationMessage('验证完成');
vscode.window.showInformationMessage('状态已刷新');
```

## ⚠️ 常见陷阱

### 1. 工作区混淆问题

```typescript
// ❌ 坏 - 验证发现问题在 projectB，但修复应用到 projectA
class Validator {
  async validate() {
    for (const folder of vscode.workspace.workspaceFolders!) {
      if (hasProblem(folder)) {
        // 只记录了问题，没保存 folder 引用
        problems.push({ message: `${folder.name} 有问题` });
      }
    }
  }
  
  async fix() {
    // 修复时无法知道是哪个 folder
    await fixFirstWorkspace(); // ❌ 错误！
  }
}

// ✅ 好 - 保持工作区引用
interface Problem {
  message: string;
  workspace: vscode.WorkspaceFolder; // 保存引用
}

class Validator {
  async validate(): Promise<Problem[]> {
    const problems: Problem[] = [];
    for (const folder of vscode.workspace.workspaceFolders!) {
      if (hasProblem(folder)) {
        problems.push({ 
          message: `${folder.name} 有问题`,
          workspace: folder // ✅ 保存引用
        });
      }
    }
    return problems;
  }
  
  async fix(problem: Problem) {
    // 修复正确的工作区
    await fixWorkspace(problem.workspace); // ✅ 正确
  }
}
```

### 2. 异步操作与状态管理

```typescript
// ❌ 坏 - 异常后状态泄漏
async function doSomething() {
  loading = true;
  await dangerousOperation(); // 可能抛异常
  loading = false; // 永远不会执行
}

// ✅ 好 - finally 保证清理
async function doSomething() {
  try {
    loading = true;
    await dangerousOperation();
  } catch (error) {
    vscode.window.showErrorMessage(`操作失败: ${error}`);
  } finally {
    loading = false; // ✅ 总是执行
  }
}
```

### 3. 文件操作与目录创建

```typescript
// ❌ 坏 - 目录和文件分步创建，中间可能失败
async function createConfig(folder: vscode.WorkspaceFolder) {
  const dir = path.join(folder.uri.fsPath, '.github');
  fs.mkdirSync(dir, { recursive: true }); // 成功
  // 这里抛异常，目录已创建但文件未写入
  const content = await fetchContent(); // ❌ 可能失败
  fs.writeFileSync(path.join(dir, 'config.md'), content);
}

// ✅ 好 - 先准备内容，再一次性写入
async function createConfig(folder: vscode.WorkspaceFolder) {
  try {
    // 先获取所有需要的数据
    const content = await fetchContent();
    
    // 再操作文件系统
    const dir = path.join(folder.uri.fsPath, '.github');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'config.md'), content);
    
  } catch (error) {
    // 清理失败的操作
    throw new Error(`创建配置失败: ${error}`);
  }
}

### 4. 无意义的备份文件污染

```typescript
// ❌ 坏 - 默认生成 .backup，污染用户工作区
function writeWithBackup(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, `${filePath}.backup.${Date.now()}`);
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ✅ 好 - 默认直接覆盖；如果风险较高，用确认框 + 明确告知影响范围
async function safeOverwrite(filePath: string, content: string, label: string) {
  const confirm = await vscode.window.showWarningMessage(
    `确认覆盖 ${label}？`,
    { modal: true },
    '确认',
    '取消'
  );
  if (confirm !== '确认') return;
  fs.writeFileSync(filePath, content, 'utf-8');
}
```

### 5. 右键菜单/按钮消失（动态 contextKey 导致）

```typescript
// ✅ 建议 - 菜单常驻展示，执行时再校验（避免“刚操作完菜单消失”的体验）
// 1) contributes.menus 的 when 条件尽量保持静态
// 2) 命令执行时做校验：是否项目根目录/是否存在目标文件/是否允许操作
// 3) 校验失败给出明确提示，而不是隐藏入口
```
```

## 📋 代码审查清单

- [ ] 所有涉及工作区的操作都显式传递 `WorkspaceFolder` 参数
- [ ] TreeItem 包含必要的上下文信息（workspace、resourceUri）
- [ ] 命令通过参数接收上下文，不依赖全局状态
- [ ] 异步操作有 try-catch-finally
- [ ] 文件操作前检查目录存在性
- [ ] 错误信息明确指出是哪个工作区
- [ ] 减少弹窗，优先使用状态栏、QuickPick、TreeView
- [ ] 所有用户可见文本有清晰的成功/失败标识（✅/❌）

## 🔧 实用工具模式

### 工作区查找

```typescript
// 查找包含特定文件的工作区
function findWorkspaceByFile(fileName: string): vscode.WorkspaceFolder | undefined {
  return vscode.workspace.workspaceFolders?.find(folder => 
    fs.existsSync(path.join(folder.uri.fsPath, fileName))
  );
}

// 查找当前活动编辑器所在的工作区
function getActiveWorkspace(): vscode.WorkspaceFolder | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) return undefined;
  
  return vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
}
```

### 配置文件管理

```typescript
// 确保 .gitignore 包含指定文件
function ensureGitIgnore(workspacePath: string, fileToIgnore: string): void {
  const gitignorePath = path.join(workspacePath, '.gitignore');
  
  let content = '';
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8');
  }
  
  const lines = content.split('\n');
  const alreadyIgnored = lines.some(line => 
    line.trim() === fileToIgnore || line.trim() === `/${fileToIgnore}`
  );
  
  if (!alreadyIgnored) {
    const newContent = content.trim() + '\n\n# Auto-generated files\n' + fileToIgnore + '\n';
    fs.writeFileSync(gitignorePath, newContent, 'utf-8');
  }
}
```

### 备份策略

```typescript
// 默认不生成备份文件（避免污染用户工作区）
// 如涉及高风险覆盖：用确认弹窗 + 明确告知影响范围
async function safeOverwrite(filePath: string, content: string, label: string): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    `确认覆盖 ${label}？`,
    { modal: true },
    '确认',
    '取消'
  );
  if (confirm !== '确认') return;
  fs.writeFileSync(filePath, content, 'utf-8');
}
```

## 🚀 性能优化

```typescript
// 批量操作使用 Promise.all
const results = await Promise.all(
  workspaceFolders.map(folder => validateWorkspace(folder))
);

// 大数据集使用 lazy loading
class LazyTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    if (!element) {
      // 只返回顶层项
      return this.getRootItems();
    }
    // 展开时才加载子项
    return this.getChildItems(element);
  }
}
```

## 📚 VS Code API 关键点

### 状态持久化

```typescript
// 使用 workspace state 存储工作区级配置
context.workspaceState.update('selectedItems', ['item1', 'item2']);
const selected = context.workspaceState.get<string[]>('selectedItems', []);

// 使用 global state 存储用户级配置
context.globalState.update('lastUsed', Date.now());
```

### 配置读写

```typescript
// 读取用户配置
const config = vscode.workspace.getConfiguration('myExtension');
const value = config.get<string>('someOption', 'default');

// 写入用户配置
await config.update('someOption', 'newValue', vscode.ConfigurationTarget.Global);
```

### 输出通道

```typescript
const outputChannel = vscode.window.createOutputChannel('My Extension');
outputChannel.appendLine('Debug info');
outputChannel.show(); // 显示输出面板
```

## 🚨 血泪教训：真实踩坑案例

### 案例 1：外部依赖导致命令失效（2025-12-12）

**问题现象**：
- 所有命令报错：`command 'xxx' not found`
- 编译通过，本地开发正常
- 打包安装后完全不工作

**根本原因**：
```typescript
// AgentManager.ts
import axios from 'axios';  // ❌ 外部依赖

// package.json 中有依赖声明
"dependencies": {
  "axios": "^1.13.2"
}

// 但 vsce package 不打包 node_modules！
// 用户安装后找不到 axios 模块
// ProjectStatusView 初始化失败
// 所有命令都无法注册
```

**调试过程**：
1. ✅ 检查命令定义 - 正确
2. ✅ 检查命令注册 - 正确
3. ✅ 检查编译输出 - 正确
4. ✅ 检查 vsix 包内容 - 正确
5. ❌ **未检查**：vsix 包是否包含 node_modules
6. ❌ **未检查**：运行时依赖是否真实可用

**正确做法**：
```typescript
// ✅ 使用内置模块
import * as https from 'https';

private async loadFromGitHub(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        resolve(data);
      });
      res.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
```

**防范措施**：
1. **开发前**：检查项目是否有 webpack/esbuild 配置
2. **开发中**：优先使用内置模块
3. **开发后**：打包验证
   ```bash
   vsce package
   unzip -l extension.vsix | grep node_modules  # 应该为空！
   code --install-extension extension.vsix
   # 重启 VS Code 测试所有功能
   ```

### 案例 2：VS Code 缓存导致更新不生效

**问题现象**：
- 卸载重装后，命令还是旧版本
- 代码明明修改了，但运行的是旧代码

**原因**：
- VS Code 缓存了扩展代码
- `code --install-extension` 不会清除缓存

**解决方案**：
```bash
# 1. 卸载
code --uninstall-extension publisher.extension-name

# 2. 重启扩展主机（而不是重启 VS Code）
# Cmd+Shift+P → "Developer: Restart Extension Host"

# 3. 安装新版本
code --install-extension extension.vsix

# 4. 再次重启扩展主机
```

### 案例 3：激活事件配置错误

**问题现象**：
- 扩展已安装，但命令找不到
- 查看 Running Extensions，扩展未激活

**原因**：
```json
// ❌ 激活太晚
"activationEvents": ["onStartupFinished"]

// ✅ 立即激活
"activationEvents": ["*"]
```

**教训**：
- 对于命令驱动的扩展，使用 `"*"` 激活
- 只在性能敏感场景才用延迟激活

## 📋 开发检查清单（强制执行）

### 代码提交前

- [ ] **零外部依赖** 或已配置 webpack/esbuild
- [ ] 所有命令在 `extension.ts` 中注册
- [ ] 所有命令在 `package.json` 中声明
- [ ] TypeScript 编译无错误：`npm run compile`
- [ ] 激活事件正确配置

### 打包发布前

- [ ] 执行 `vsce package`
- [ ] 验证包内容：`unzip -l extension.vsix`
- [ ] 确认 **无** `node_modules`（除非配置了打包工具）
- [ ] 本地安装测试：`code --install-extension extension.vsix`
- [ ] **重启扩展主机** 后测试所有命令
- [ ] 检查 Developer Tools Console 无错误

### 用户报告 Bug 后

- [ ] 要求用户执行 `Developer: Restart Extension Host`
- [ ] 检查扩展是否激活：`Developer: Show Running Extensions`
- [ ] 查看 Console 错误：`Developer: Toggle Developer Tools`
- [ ] 验证命令是否注册：
  ```javascript
  vscode.commands.getCommands().then(cmds => 
    console.log(cmds.filter(c => c.includes('yourExtension')))
  )
  ```

## 完整规范

**参考规范**: 
- TypeScript 严格模式: `/common/typescript-strict.md`
- 错误处理模式: 本文档错误处理章节
- 用户体验设计: 本文档静默式 UX 章节

**实战案例**:
- Copilot Prompts Manager 插件源码
- ConfigValidator 的 checkMissingConfigs 方法
- ConfigManager 的 applyConfigToWorkspace 方法

**血泪教训**：
- ⚠️ axios 依赖导致所有命令失效（2025-12-12）
- ⚠️ 编译通过 ≠ 运行时可用
- ⚠️ 本地开发正常 ≠ 打包后正常
