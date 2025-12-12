# Bug 修复报告：外部依赖导致扩展失效

## 📅 时间线

**发现时间**: 2025-12-12 16:30  
**解决时间**: 2025-12-12 17:05  
**持续时间**: 35 分钟  
**严重级别**: 🔴 Critical - 所有功能完全不可用

---

## 🐛 问题现象

用户安装扩展后，**所有命令**报错：

```
command 'copilotPrompts.createAgent' not found
command 'copilotPrompts.autoConfigAll' not found
command 'copilotPrompts.updateProjectConfig' not found
```

**困惑点**：
- ✅ 编译通过（`npm run compile`）
- ✅ 本地开发环境运行正常
- ✅ 打包成功（`vsce package`）
- ✅ 安装成功（`code --install-extension`）
- ❌ 运行时所有命令失效

---

## 🔍 调试过程

### 尝试 1-5：检查命令注册（30分钟）

**验证项**：
1. ✅ 命令在 `extension.ts` 中定义
2. ✅ 命令在 `context.subscriptions` 中注册
3. ✅ 命令在 `package.json` 中声明
4. ✅ 编译后的 `out/extension.js` 包含命令
5. ✅ vsix 包中包含 `extension.js`

**结论**：代码完全正确，但运行时仍然失败 ❌

### 尝试 6-8：检查 VS Code 环境（15分钟）

**验证项**：
1. 尝试重启扩展主机
2. 尝试完全退出 VS Code
3. 尝试清除扩展缓存

**结论**：仍然失败 ❌

### 🎯 突破点：检查依赖（5分钟）

```bash
# 检查 vsix 包内容
unzip -l copilot-prompts-manager-2.0.0.vsix | grep -i axios

# 结果：无输出！
```

**发现**：`axios` 依赖没有被打包进 vsix！

---

## 💡 根本原因

### 技术原因

**VS Code 扩展打包机制**：
```
vsce package
  ↓
  打包 src/ → out/（编译后的代码）
  打包 package.json、README.md 等
  ❌ 不打包 node_modules/
```

**问题链条**：
```
AgentManager.ts 引入 axios
  ↓
ProjectStatusView 依赖 AgentManager
  ↓
extension.ts 初始化 ProjectStatusView
  ↓
运行时：require('axios') → 找不到模块
  ↓
ProjectStatusView 构造函数抛异常
  ↓
所有相关命令无法注册
```

### 代码证据

```typescript
// src/core/AgentManager.ts (有问题的代码)
import axios from 'axios';  // ❌ 外部依赖

private async loadFromGitHub(id: string): Promise<string> {
  const response = await axios.get(agent.url, { timeout: 10000 });
  return response.data;
}
```

```json
// package.json
{
  "dependencies": {
    "axios": "^1.13.2"  // ❌ 依赖存在于 package.json
  }
  // ❌ 但没有 webpack/esbuild 配置
}
```

### 为什么本地开发正常？

```
本地开发：
  node_modules/axios ✅ 存在
  require('axios') ✅ 成功

打包后：
  vsix 包中无 node_modules/axios ❌
  用户机器上 require('axios') ❌ 失败
```

---

## ✅ 解决方案

### 代码修改

```typescript
// src/core/AgentManager.ts (修复后)
import * as https from 'https';  // ✅ Node.js 内置模块

private async loadFromGitHub(id: string): Promise<string> {
  const config = await this.loadConfig();
  const agent = config.agents[id];
  
  if (!agent || !agent.url) {
    throw new Error(`Agent "${id}" not found in config or missing URL`);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Request timeout')), 10000);
    
    https.get(agent.url!, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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

### 依赖清理

```bash
npm uninstall axios
```

### 验证

```bash
# 1. 编译
npm run compile

# 2. 打包
vsce package

# 3. 验证包内容
unzip -l copilot-prompts-manager-2.0.0.vsix | grep node_modules
# 输出：（无结果） ✅ 正确

# 4. 安装测试
code --uninstall-extension forlear.copilot-prompts-manager
code --install-extension copilot-prompts-manager-2.0.0.vsix

# 5. 重启扩展主机并测试
# Cmd+Shift+P → Developer: Restart Extension Host
# Cmd+Shift+P → Copilot Prompts: 批量配置所有项目
# ✅ 成功！
```

---

## 📚 经验教训

### 1. 编译通过 ≠ 运行时可用

```
TypeScript 编译检查：
  ✅ 类型正确
  ✅ 语法正确
  ✅ import 路径正确

运行时检查：
  ❌ 模块是否真实存在？
  ❌ 依赖是否已打包？
```

**教训**：必须在打包后的环境测试！

### 2. 本地开发 ≠ 用户环境

```
开发环境：
  node_modules/ ✅ 完整
  所有依赖可用 ✅

生产环境：
  vsix 包中无 node_modules/ ❌
  只有编译后的代码
```

**教训**：模拟生产环境测试（安装 vsix）！

### 3. VS Code 扩展的特殊性

**常规 Node.js 项目**：
```bash
npm install  # 安装依赖
node app.js  # 运行（依赖可用）
```

**VS Code 扩展**：
```bash
npm install      # 开发时安装依赖
vsce package     # 打包（默认不包含依赖！）
用户安装 vsix     # 用户机器上无依赖
```

**教训**：VS Code 扩展 ≠ 常规 Node.js 项目！

### 4. 优先使用内置模块

**Node.js 内置模块**（总是可用）：
- `fs` - 文件系统
- `path` - 路径操作
- `https` / `http` - HTTP 请求
- `crypto` - 加密
- `os` - 操作系统信息
- `child_process` - 子进程

**外部依赖**（需要打包配置）：
- `axios` → 用 `https` 替代
- `lodash` → 手写工具函数
- `moment` → 用 `Date` 或 `Intl` API

**教训**：能用内置的，绝不引入外部依赖！

---

## 🛡️ 预防措施

### 开发规范更新

已更新 `agents/vscode-extension-dev.agent.md`，新增：

1. **依赖管理与打包** 专项章节
2. **血泪教训：真实踩坑案例** 部分
3. **开发检查清单** 强制执行项

### 强制检查清单

**代码提交前**：
- [ ] 零外部依赖 或 已配置 webpack/esbuild
- [ ] `npm run compile` 无错误

**打包发布前**：
- [ ] `vsce package` 成功
- [ ] `unzip -l extension.vsix | grep node_modules` 为空（或已配置打包）
- [ ] 本地安装测试：`code --install-extension extension.vsix`
- [ ] **重启扩展主机** 后测试所有命令
- [ ] 检查 Developer Tools Console 无错误

### CI/CD 集成建议

```yaml
# .github/workflows/test.yml
- name: Package Extension
  run: vsce package

- name: Verify No External Dependencies
  run: |
    unzip -l *.vsix | grep node_modules && exit 1 || echo "OK"

- name: Test Packaged Extension
  run: |
    code --install-extension *.vsix
    code --list-extensions | grep copilot-prompts-manager
```

---

## 📊 影响评估

**受影响功能**: 100%（所有命令）  
**用户影响**: 🔴 严重 - 扩展完全无法使用  
**修复难度**: 🟢 简单 - 替换 1 个依赖  
**发现难度**: 🔴 困难 - 需要深入理解打包机制  

**为什么难发现**：
1. 编译通过，给了虚假的安全感
2. 本地开发环境正常，掩盖了问题
3. VS Code 扩展打包机制与常规 Node.js 项目不同

---

## 🎯 总结

这是一个典型的"**环境差异**"导致的 Bug：

```
开发环境 ✅ → 测试通过 → 信心满满
  ↓
生产环境 ❌ → 完全失效 → 用户投诉
```

**核心问题**：没有在"用户真实环境"（打包后的 vsix）测试。

**根本教训**：
1. **永远不要相信"编译通过"**
2. **永远不要相信"本地能跑"**
3. **必须在接近生产的环境测试**
4. **VS Code 扩展 = 特殊的 Node.js 应用**

**一句话总结**：  
> "The code works on my machine" 是程序员最危险的自信。

---

## 🔗 相关资源

- [VS Code Extension API](https://code.visualstudio.com/api)
- [vsce Package Tool](https://github.com/microsoft/vscode-vsce)
- [Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [Node.js Built-in Modules](https://nodejs.org/docs/latest/api/)

---

**文档版本**: 1.0  
**最后更新**: 2025-12-12  
**作者**: GitHub Copilot (Claude Sonnet 4.5)
