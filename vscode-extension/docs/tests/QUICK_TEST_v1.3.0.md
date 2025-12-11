# v1.3.0 快速测试指南

## ✅ 安装确认

v1.3.0 插件已成功安装，重新加载 VS Code 后即可测试。

---

## 🧪 测试步骤

### 1. 重新加载 VS Code

```
Cmd + Shift + P → Developer: Reload Window
```

---

### 2. 查看输出日志

测试前先打开输出通道，观察加载过程：

```
Cmd + Shift + U → 选择 "Copilot Prompts Manager"
```

**预期输出**:
```
[时间] Copilot Prompts Manager v1.3.0 已启动
[时间] 配置源: GitHub (https://github.com/ForLear/copilot-prompts)
[时间] 正在从 GitHub 加载配置列表...
[时间] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/agents?ref=main
[时间] ✅ 获取到 4 个 agent 文件
[时间] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/common?ref=main
[时间] ✅ 获取到 4 个 common prompt 文件
[时间] ✅ 配置列表加载完成 (共 8 个)
```

---

### 3. 测试配置列表加载

**操作**: 点击 "Select Prompts" 按钮

**预期结果**:
- 显示配置选择列表
- 包含从 GitHub 动态获取的配置：
  - ✅ VitaSage Agent
  - ✅ Vue 3 Agent
  - ✅ TypeScript Agent
  - ✅ i18n Agent
  - ✅ 以及其他 common prompts

**输出日志应显示**:
```
[时间] 显示配置选择列表 (8 个配置)
```

---

### 4. 测试配置应用

#### 4.1 选择项目

确保在 Omipay.userCenter 项目中：
```
工作区: Omipay.userCenter
```

#### 4.2 应用配置

**操作**:
1. 勾选 "VitaSage Agent"
2. 观察输出日志

**预期日志**:
```
[时间] 应用配置: VitaSage Agent
[时间] 目标项目: /Users/pailasi/Work/Omipay.userCenter
[时间] 获取文件内容: agents/vitasage.agent.md
[时间] GET https://raw.githubusercontent.com/ForLear/copilot-prompts/main/agents/vitasage.agent.md
[时间] ✅ 文件内容获取成功
[时间] 正在加载项目文档...
[时间] GET https://raw.githubusercontent.com/ForLear/copilot-prompts/main/README.md
[时间] ✅ 项目文档加载完成
[时间] 写入配置文件: /Users/pailasi/Work/Omipay.userCenter/.github/copilot-instructions.md
[时间] ✅ 配置应用成功
```

#### 4.3 检查生成的配置文件

**打开**: `/Users/pailasi/Work/Omipay.userCenter/.github/copilot-instructions.md`

**验证内容**:

```markdown
# AI 开发指南

> 本文件自动生成，请勿手动编辑
> 配置从 GitHub 仓库动态获取: https://github.com/ForLear/copilot-prompts

---

# 📚 项目文档汇总（优化 Copilot 生成质量）

## 📄 README.md
[内容应存在...]

## 📄 BEST_PRACTICES.md
[内容应存在...]

## 📄 AGENTS_GUIDE.md
[内容应存在...]

---

<!-- Source: agents/vitasage.agent.md -->
[Agent 内容应存在...]

---

生成时间: [当前时间]
配置来源: GitHub (动态获取)
```

**关键检查点**:
- ✅ 包含项目文档汇总部分
- ✅ 包含 VitaSage Agent 完整内容
- ✅ 配置来源标注为 "GitHub (动态获取)"
- ✅ 生成时间正确

---

### 5. 测试刷新功能

**操作**: 点击 ⚡ 刷新按钮

**预期日志**:
```
[时间] 刷新配置...
[时间] 清除缓存
[时间] 正在从 GitHub 重新加载配置列表...
[时间] GET https://api.github.com/repos/ForLear/copilot-prompts/contents/agents?ref=main
[时间] ✅ 配置列表刷新完成 (共 8 个)
```

**验证**:
- ✅ 配置列表重新加载
- ✅ 如果 GitHub 仓库有新增文件，应显示在列表中

---

### 6. 测试缓存机制

**操作**:
1. 应用一个配置 (如 Vue 3 Agent)
2. 立即再次应用同一配置

**预期日志**:
```
第一次:
[时间] GET https://raw.githubusercontent.com/.../vue3.agent.md
[时间] ✅ 文件内容获取成功

第二次 (5分钟内):
[时间] 使用缓存的配置内容
[时间] ✅ 配置应用成功 (缓存)
```

**验证**:
- ✅ 第二次明显更快（无网络请求）
- ✅ 日志显示 "缓存" 字样

---

### 7. 测试网络失败降级

**模拟网络失败** (可选):
```bash
# 临时断开网络，或修改 hosts 文件
sudo vim /etc/hosts
# 添加: 127.0.0.1 api.github.com
```

**预期行为**:
- ⚠️ 日志显示网络错误
- ✅ 自动降级到内置配置
- ✅ 基本功能仍可用

**输出日志**:
```
[时间] ❌ GitHub API 请求失败: Error: ...
[时间] ⚠️ 降级到本地配置
[时间] ✅ 加载内置配置 (4 个)
```

---

## 📋 测试检查清单

| 功能 | 测试项 | 结果 |
|------|--------|------|
| **插件激活** | 输出通道显示 v1.3.0 启动 | ☐ |
| **GitHub 加载** | 自动从 GitHub 获取配置列表 | ☐ |
| **配置列表** | 显示 8+ 个配置 | ☐ |
| **文档集成** | 生成的配置包含项目文档 | ☐ |
| **配置应用** | 成功应用到项目 | ☐ |
| **缓存机制** | 5分钟内重复操作使用缓存 | ☐ |
| **刷新功能** | 手动刷新获取最新配置 | ☐ |
| **日志输出** | 输出通道显示详细日志 | ☐ |
| **降级处理** | 网络失败时使用内置配置 | ☐ (可选) |

---

## 🐛 常见问题

### 问题1: 配置列表为空

**检查**:
1. 输出日志是否有错误
2. 网络是否正常: `ping github.com`
3. 是否被防火墙阻止

**解决**:
- 点击刷新按钮重试
- 检查代理设置
- 如持续失败，会自动降级

---

### 问题2: 配置应用后未生效

**检查**:
1. `.github/copilot-instructions.md` 文件是否创建
2. 文件内容是否完整
3. 是否在正确的项目文件夹

**解决**:
- 查看输出日志确认写入路径
- 检查文件权限
- 手动创建 `.github/` 目录

---

### 问题3: 日志中显示 404 错误

**原因**: GitHub 仓库路径错误或文件不存在

**检查**:
1. 浏览器访问: https://github.com/ForLear/copilot-prompts
2. 确认仓库存在且公开
3. 确认文件路径正确

---

## ✨ 成功标志

所有测试通过后，你应该看到：

1. ✅ 输出日志显示成功加载 8+ 个配置
2. ✅ 配置选择列表显示所有配置
3. ✅ 应用配置成功创建 copilot-instructions.md
4. ✅ 生成的文件包含项目文档部分
5. ✅ 缓存机制正常工作（第二次快速）
6. ✅ 刷新功能正常重新加载

---

## 🎉 下一步

测试成功后：

1. **日常使用**: 勾选需要的配置，自动应用
2. **定期刷新**: 每周点击刷新按钮，获取最新配置
3. **查看日志**: 遇到问题时查看输出通道
4. **反馈问题**: 到 GitHub 提 issue

---

**测试完成时间**: ________________  
**测试者**: ________________  
**测试结果**: ☐ 通过  ☐ 部分通过  ☐ 失败
