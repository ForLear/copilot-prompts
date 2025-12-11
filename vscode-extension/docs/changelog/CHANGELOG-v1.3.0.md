# Changelog - v1.3.0

**发布日期**: 2025-12-11

## 🚀 重大更新：动态 GitHub 配置

v1.3.0 实现了从 GitHub 动态获取配置的能力，告别硬编码配置列表，同时集成项目文档以优化 Copilot 生成质量。

---

## ✨ 核心新功能

### 1. 从 GitHub 动态获取配置 🌐

**功能描述**:
- ✅ 不再使用硬编码的 `prompts: PromptData[]` 数组
- ✅ 自动从 `https://github.com/ForLear/copilot-prompts` 获取最新配置
- ✅ 支持自动发现新增的 agents 和 prompts（无需插件更新）
- ✅ 配置更新即时可用（点击刷新即可）

**技术实现**: 新增 `src/githubClient.ts` 模块

```typescript
class GitHubClient {
  // 获取 agents/ 和 common/ 目录下的所有 .md 文件
  async fetchPromptsList(): Promise<PromptData[]>
  
  // 获取单个文件的完整内容
  async fetchFileContent(path: string): Promise<string>
  
  // 汇总项目文档 (README, BEST_PRACTICES, etc.)
  async fetchProjectDocs(): Promise<string>
}
```

**使用流程**:
1. 插件激活时自动从 GitHub 加载配置列表
2. 用户勾选配置 → 从 GitHub 获取文件内容
3. 点击刷新按钮 → 重新从 GitHub 拉取最新配置

---

### 2. 项目文档集成 📚

**功能描述**:
- ✅ 自动汇总 `README.md`, `BEST_PRACTICES.md`, `AGENTS_GUIDE.md`, `MANAGER_GUIDE.md`
- ✅ 将文档内容插入到生成的 `copilot-instructions.md` 顶部
- ✅ 为 Copilot 提供更多项目上下文，优化代码生成质量

**生成的配置文件结构**:

```markdown
# AI 开发指南

> 本文件自动生成，请勿手动编辑
> 配置从 GitHub 仓库动态获取: https://github.com/ForLear/copilot-prompts

---

# 📚 项目文档汇总（优化 Copilot 生成质量）

## 📄 README.md
[Copilot Prompts 中央仓库介绍...]

## 📄 BEST_PRACTICES.md
[最佳实践指南...]

## 📄 AGENTS_GUIDE.md
[Agents 使用说明...]

## 📄 MANAGER_GUIDE.md
[管理员指南...]

---

<!-- Source: agents/vitasage.agent.md -->
[Agent 内容...]

---

生成时间: 2025-12-11 10:30:00
配置来源: GitHub (动态获取)
```

---

### 3. 智能缓存机制 ⚡

**功能描述**:
- ✅ 5分钟内存缓存，减少 GitHub API 调用
- ✅ 支持手动刷新获取最新配置
- ✅ 网络失败时自动降级到本地配置

**实现细节**:

```typescript
private cache = new Map<string, CachedData>()
private CACHE_TTL = 5 * 60 * 1000 // 5分钟

// 缓存逻辑
if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
  return cached.data
}

// 获取新数据并缓存
const data = await this.fetchFromGitHub()
this.cache.set(key, { data, timestamp: Date.now() })
```

**降级配置**: 网络失败时使用内置的基础配置
- VitaSage Agent
- Vue 3 Agent
- TypeScript Agent
- i18n Agent

---

### 4. 输出日志通道 📋

**功能描述**:
- ✅ 新增 "Copilot Prompts Manager" 输出通道
- ✅ 实时显示配置加载和应用过程
- ✅ 便于调试和问题排查

**查看方式**: `Cmd+Shift+U` → 选择 "Copilot Prompts Manager"

**示例输出**:
```
[10:30:00] Copilot Prompts Manager v1.3.0 已启动
[10:30:00] 配置源: GitHub (动态获取)
[10:30:01] 正在从 GitHub 加载配置...
[10:30:02] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/agents?ref=main
[10:30:03] 发现 4 个 agent 文件
[10:30:03] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/common?ref=main
[10:30:04] 发现 4 个 common prompt 文件
[10:30:05] ✅ 成功加载 8 个配置
[10:30:10] 应用配置: VitaSage Agent
[10:30:11] 获取文件内容: agents/vitasage.agent.md
[10:30:12] 获取项目文档...
[10:30:14] ✅ 配置已应用到 /Users/xxx/project/.github/copilot-instructions.md
```

---

## 🔧 技术架构改进

### 新增模块

#### `src/githubClient.ts` (456 行)

**核心功能**:
1. **GitHub API 客户端**: 封装 REST API 调用
2. **文件元数据解析**: 从 frontmatter 提取 `description` 和 `tools`
3. **缓存管理**: 内存缓存减少网络请求
4. **错误处理**: 降级到本地配置

**关键方法**:
```typescript
// 获取配置列表 (agents + common)
async fetchPromptsList(): Promise<PromptData[]>

// 获取单个文件内容
async fetchFileContent(path: string): Promise<string>

// 汇总项目文档
async fetchProjectDocs(): Promise<string>

// 解析文件元数据 (frontmatter)
private parseFileMetadata(content: string): { description?: string; tools?: string[] }
```

---

### 更新模块

#### `src/configManager.ts`

**重大变更**:

**v1.2.0 (硬编码)**:
```typescript
private prompts: PromptData[] = [
  {
    label: 'VitaSage Agent',
    description: 'VitaSage 工业配方管理系统专用 Agent',
    path: 'agents/vitasage.agent.md'
  },
  // ... 硬编码列表
]
```

**v1.3.0 (动态获取)**:
```typescript
private githubClient: GitHubClient
private projectDocs: string = ''

// 初始化时从 GitHub 加载
async initialize() {
  this.prompts = await this.githubClient.fetchPromptsList()
  this.projectDocs = await this.githubClient.fetchProjectDocs()
}

// 刷新配置
async refresh() {
  this.prompts = await this.githubClient.fetchPromptsList()
  this.projectDocs = await this.githubClient.fetchProjectDocs()
  // 更新 UI...
}
```

**新增功能**:
- `initialize()`: 异步初始化，从 GitHub 加载配置
- `refresh()`: 手动刷新，获取最新配置
- 集成项目文档到生成的配置文件

---

#### `src/extension.ts`

**变更**:
1. 创建输出通道 `outputChannel`
2. 传递给 `ConfigManager` 用于日志输出
3. 更新刷新命令逻辑

```typescript
const outputChannel = vscode.window.createOutputChannel('Copilot Prompts Manager')
outputChannel.appendLine('[Info] Copilot Prompts Manager v1.3.0 已启动')

const configManager = new ConfigManager(context, outputChannel)
await configManager.initialize() // 异步初始化

// 刷新命令
vscode.commands.registerCommand('copilot-prompts-manager.refresh', async () => {
  await configManager.refresh()
})
```

---

## 📊 使用体验对比

### 配置更新流程

| 场景 | v1.2.0 | v1.3.0 |
|------|--------|--------|
| prompts 仓库新增文件 | ① 等待插件作者手动更新硬编码列表<br>② 等待插件发布新版本<br>③ 用户更新插件 | ① 用户点击刷新按钮 ✅ |
| 修改已有 prompt 内容 | ① 等待插件发布<br>② 用户更新插件 | ① 实时生效（缓存5分钟后自动更新）✅ |
| 离线使用 | ✅ 正常使用（本地配置） | ✅ 降级到内置配置 |

### 首次使用流程

**v1.2.0**:
1. 安装插件
2. 打开项目
3. 点击 "Select Prompts" 勾选配置
4. 配置立即应用

**v1.3.0**:
1. 安装插件
2. 打开项目
3. **自动从 GitHub 加载配置列表**（新增 2-3秒）
4. 点击 "Select Prompts" 勾选配置
5. **从 GitHub 获取文件内容并应用**（新增 2-3秒）

**总结**: 首次稍慢（+4秒），但换来配置的实时性和文档集成

---

## 🌐 网络配置

### GitHub API 端点

| API | 用途 | 调用频率 |
|-----|------|---------|
| `GET /repos/ForLear/copilot-prompts/contents/agents?ref=main` | 获取 agents 列表 | 首次加载 + 手动刷新 |
| `GET /repos/ForLear/copilot-prompts/contents/common?ref=main` | 获取 common 列表 | 首次加载 + 手动刷新 |
| `GET https://raw.githubusercontent.com/ForLear/copilot-prompts/main/{path}` | 获取文件内容 | 应用配置时 |
| `GET https://raw.githubusercontent.com/ForLear/copilot-prompts/main/README.md` | 获取项目文档 | 应用配置时（一次性） |

### API 限流说明

- **GitHub API 限流**: 未认证 60 次/小时，认证 5000 次/小时
- **缓存策略**: 5分钟缓存，正常使用远低于限流
- **降级处理**: 超限时自动使用本地配置，不影响功能

---

## 🐛 Bug 修复

1. ✅ 修复硬编码配置导致新增 prompts 不可见的问题
2. ✅ 修复配置路径查找逻辑（移除本地路径依赖）
3. ✅ 优化多文件夹工作区的配置管理

---

## 📝 升级指南

### 从 v1.2.0 升级到 v1.3.0

```bash
# 1. 进入插件目录
cd /Users/pailasi/Work/copilot-prompts/vscode-extension

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖（如有新增）
npm install

# 4. 编译 TypeScript
npm run compile

# 5. 打包插件
vsce package

# 6. 安装新版本（强制覆盖）
code --install-extension copilot-prompts-manager-1.3.0.vsix --force

# 7. 重新加载 VS Code
# Cmd + Shift + P → Developer: Reload Window
```

### 首次使用 v1.3.0

安装后会自动：
1. 从 GitHub 加载配置列表（2-3秒）
2. 加载项目文档（README, BEST_PRACTICES 等）
3. 在输出通道显示加载日志
4. 选择默认配置（如有）

---

## 🔍 故障排查

### 问题1: 配置列表为空

**可能原因**:
- 网络连接问题
- GitHub API 限流
- 仓库不可访问

**解决方法**:
1. 检查网络连接: `ping github.com`
2. 查看输出通道日志:
   - `Cmd+Shift+U`
   - 选择 "Copilot Prompts Manager"
   - 查看错误信息
3. 点击刷新按钮重试
4. 如持续失败，插件会自动使用降级配置（4个内置 agents）

---

### 问题2: 配置未更新

**可能原因**:
- 缓存未过期（5分钟）
- GitHub 内容未实际变更

**解决方法**:
1. 点击刷新按钮（⚡图标）强制刷新
2. 查看输出日志确认获取成功
3. 检查 GitHub 仓库内容是否确实更新

---

### 问题3: 网络慢或不稳定

**表现**:
- 插件激活缓慢
- 应用配置时卡顿

**解决方法**:
1. 等待缓存生效（首次慢，后续快）
2. 如长期网络不佳，考虑：
   - 使用 GitHub 镜像站（需修改源码）
   - Fork 仓库到自己的 GitHub（修改配置）
   - 使用 v1.2.0 本地配置版本

---

## 🎨 界面变化

### 输出通道

**打开方式**: `Cmd+Shift+U` → 选择 "Copilot Prompts Manager"

**日志示例**:
```
[10:30:00] Copilot Prompts Manager v1.3.0 已启动
[10:30:00] 配置源: GitHub (https://github.com/ForLear/copilot-prompts)
[10:30:01] 正在从 GitHub 加载配置列表...
[10:30:02] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/agents?ref=main
[10:30:03] ✅ 获取到 4 个 agent 文件:
            - vitasage.agent.md
            - vue3.agent.md
            - typescript.agent.md
            - i18n.agent.md
[10:30:03] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/common?ref=main
[10:30:04] ✅ 获取到 4 个 common prompt 文件
[10:30:05] ✅ 配置列表加载完成 (共 8 个)
[10:30:05] 正在加载项目文档...
[10:30:06] ✅ 项目文档加载完成 (4 个文件)

--- 用户操作: 选择 "VitaSage Agent" ---

[10:30:10] 应用配置: VitaSage Agent
[10:30:10] 目标项目: /Users/xxx/Work/Omipay.userCenter
[10:30:11] 获取文件内容: agents/vitasage.agent.md
[10:30:11] GET https://raw.githubusercontent.com/ForLear/copilot-prompts/main/agents/vitasage.agent.md
[10:30:12] ✅ 文件内容获取成功 (12345 字节)
[10:30:12] 写入配置文件: /Users/xxx/Work/Omipay.userCenter/.github/copilot-instructions.md
[10:30:13] ✅ 配置应用成功
```

---

## 💡 最佳实践

### 1. 定期刷新配置

**建议**: 每周点击一次刷新按钮，获取最新的 prompts

**操作**: 点击插件界面右上角的 ⚡ 刷新按钮

---

### 2. 关注输出日志

**场景**: 遇到配置问题时

**步骤**:
1. `Cmd+Shift+U` 打开输出面板
2. 选择 "Copilot Prompts Manager"
3. 查看详细日志定位问题

---

### 3. 网络环境优化

**公司内网/VPN 环境**:
- 插件会自动降级到内置配置
- 基本功能不受影响
- 建议在网络通畅时刷新一次

**国际网络环境**:
- GitHub API 稳定可用
- 配置实时同步，体验最佳

---

## 📈 性能指标

| 操作 | v1.2.0 | v1.3.0 | 变化 |
|------|--------|--------|------|
| 插件激活 | < 100ms | 2-3秒 | +2秒（首次 GitHub 请求）|
| 应用配置 | 1秒 | 3-5秒 | +2秒（获取文件内容）|
| 刷新配置 | - | 2-3秒 | 新功能 |
| 缓存命中 | - | < 100ms | 高速响应 |

**总结**: 首次操作稍慢（网络请求），后续操作因缓存而快速

---

## 🔮 未来计划 (v1.4.0)

- [ ] 支持自定义 GitHub 仓库源
- [ ] 配置版本管理和回滚
- [ ] 离线模式优化（预加载常用配置）
- [ ] 配置对比和差异显示
- [ ] 多语言文档支持

---

## 👥 贡献者

- **主要开发**: Forlear
- **GitHub 仓库**: https://github.com/ForLear/copilot-prompts

---

## 📄 相关文档

- [v1.2.0 CHANGELOG](./CHANGELOG-v1.2.0.md)
- [升级测试指南](./TEST_v1.3.0.md)
- [最佳实践指南](../BEST_PRACTICES.md)
- [Agent 使用说明](../AGENTS_GUIDE.md)

---

**发布时间**: 2025-12-11  
**下一版本计划**: v1.4.0 (2025-12)
