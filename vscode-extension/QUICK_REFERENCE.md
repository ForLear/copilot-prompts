# 📖 快速导航指南

欢迎使用 **Copilot Prompts Manager v1.3.0**！

本文件将帮助你快速找到需要的内容。

---

## 🎯 我想要...

### 🚀 快速开始 (5 分钟)
1. 查看 [`docs/guides/INSTALL_GUIDE.md`](./docs/guides/INSTALL_GUIDE.md) - 安装插件
2. 运行快速测试验证功能
3. 开始使用！

### 📚 了解新功能 (15 分钟)
→ 查看 [`docs/changelog/CHANGELOG-v1.3.0.md`](./docs/changelog/CHANGELOG-v1.3.0.md)

**关键更新**:
- ✨ 从 GitHub 动态获取配置
- ✨ 自动集成项目文档
- ✨ 智能缓存机制
- ✨ 详细的日志输出

### 🧪 测试功能 (30 分钟)
→ 查看 [`docs/tests/TEST_v1.3.0.md`](./docs/tests/TEST_v1.3.0.md)

**快速测试** (5 分钟):
→ 查看 [`docs/tests/QUICK_TEST_v1.3.0.md`](./docs/tests/QUICK_TEST_v1.3.0.md)

### 🔧 遇到问题
1. 查看输出日志: `Cmd+Shift+U` → "Copilot Prompts Manager"
2. 查看 [`docs/guides/INSTALL_GUIDE.md`](./docs/guides/INSTALL_GUIDE.md) 中的故障排查
3. 查看 [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) 中的问题排查部分

### 📖 深入了解项目
→ 查看 [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md)

**包含**:
- 版本演进历史
- 架构设计说明
- 问题解决方案
- 技术指标对比

### 🗂️ 查看所有文档
→ 查看 [`docs/README.md`](./docs/README.md)

---

## 📁 文件结构速览

```
copilot-prompts-manager/
│
├── 📖 README.md                    # 插件主文档
├── 📄 PROJECT_SUMMARY.md           # 项目总结 ⭐
├── 📄 QUICK_REFERENCE.txt          # 本文件
│
├── 📦 package.json                 # 项目配置
├── 📋 LICENSE                      # 许可证
│
├── 🔧 src/                         # 源代码
│   ├── extension.ts                # 插件入口
│   ├── configManager.ts            # 配置管理
│   ├── configValidator.ts          # 检查诊断
│   ├── githubClient.ts             # GitHub 客户端 (v1.3.0 新增)
│   └── promptsProvider.ts          # UI 数据提供
│
├── 🧬 out/                         # 编译输出 (自动生成)
│
└── 📚 docs/                        # 完整文档
    ├── README.md                   # 文档导航 ⭐
    ├── changelog/                  # 版本日志
    ├── guides/                     # 使用指南
    ├── tests/                      # 测试文档
    ├── summaries/                  # 开发总结
    └── releases/                   # 发布说明
```

---

## 🔑 关键文件说明

| 文件 | 用途 | 阅读时间 |
|------|------|---------|
| [`README.md`](./README.md) | 插件主文档 | 10 分钟 |
| [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) | 项目总结 ⭐ | 15 分钟 |
| [`docs/README.md`](./docs/README.md) | 文档导航 ⭐ | 5 分钟 |
| [`docs/guides/INSTALL_GUIDE.md`](./docs/guides/INSTALL_GUIDE.md) | 安装指南 | 10 分钟 |
| [`docs/changelog/CHANGELOG-v1.3.0.md`](./docs/changelog/CHANGELOG-v1.3.0.md) | v1.3.0 更新日志 | 15 分钟 |
| [`docs/tests/QUICK_TEST_v1.3.0.md`](./docs/tests/QUICK_TEST_v1.3.0.md) | 快速测试 | 5 分钟 |
| [`docs/tests/TEST_v1.3.0.md`](./docs/tests/TEST_v1.3.0.md) | 完整测试 | 30 分钟 |

---

## ⚡ 常用命令

### 开发相关
```bash
# 编译 TypeScript
npm run compile

# 打包插件
vsce package

# 安装插件
code --install-extension copilot-prompts-manager-1.3.0.vsix --force

# 重新加载 VS Code
Cmd + Shift + P → Developer: Reload Window
```

### 查看日志
```
Cmd + Shift + U → 选择 "Copilot Prompts Manager"
```

### 打开配置文件
```
项目目录 → .github/copilot-instructions.md
```

---

## 🎯 推荐阅读路径

### 第一次使用？
```
1. 本文件 (你现在在这里) ✓
2. docs/guides/INSTALL_GUIDE.md - 了解如何安装
3. docs/tests/QUICK_TEST_v1.3.0.md - 快速验证功能
4. 开始使用插件！
```

### 想了解最新版本？
```
1. docs/changelog/CHANGELOG-v1.3.0.md - 新功能详解
2. docs/tests/TEST_v1.3.0.md - 完整功能测试
3. PROJECT_SUMMARY.md - 项目背景和架构
```

### 想深入了解项目？
```
1. PROJECT_SUMMARY.md - 项目总结和版本演进
2. docs/summaries/ - 开发历程和优化记录
3. src/ - 源代码阅读
```

---

## 🆘 常见问题快速答案

### Q: 如何安装插件？
A: 查看 [`docs/guides/INSTALL_GUIDE.md`](./docs/guides/INSTALL_GUIDE.md) 第 1 节

### Q: 无法从 GitHub 获取配置怎么办？
A: 
1. 检查网络: `ping github.com`
2. 查看输出日志: `Cmd+Shift+U`
3. 如持续失败会自动使用降级配置

### Q: 配置文件在哪里？
A: `项目目录/.github/copilot-instructions.md`

### Q: 如何测试新功能？
A: 查看 [`docs/tests/QUICK_TEST_v1.3.0.md`](./docs/tests/QUICK_TEST_v1.3.0.md)

### Q: v1.3.0 有什么新功能？
A: 查看 [`docs/changelog/CHANGELOG-v1.3.0.md`](./docs/changelog/CHANGELOG-v1.3.0.md)

### Q: 更多问题？
A: 查看 [`docs/guides/INSTALL_GUIDE.md`](./docs/guides/INSTALL_GUIDE.md) 中的故障排查

---

## 📊 版本信息

| 版本 | 发布日期 | 主要特性 | 文档 |
|------|---------|---------|------|
| v1.1.0 | 2025-12-08 | 基础 TreeView UI | `docs/changelog/CHANGELOG-v1.1.0.md` |
| v1.2.0 | 2025-12-10 | 智能检查系统 | `docs/changelog/CHANGELOG-v1.2.0.md` |
| **v1.3.0** | **2025-12-11** | **GitHub 动态配置** ⭐ | **`docs/changelog/CHANGELOG-v1.3.0.md`** |

---

## 🔗 快速链接

### 📚 文档
- [README.md](./README.md) - 主文档
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目总结
- [docs/README.md](./docs/README.md) - 文档导航

### 🎯 最常用
- [安装指南](./docs/guides/INSTALL_GUIDE.md)
- [v1.3.0 Changelog](./docs/changelog/CHANGELOG-v1.3.0.md)
- [快速测试](./docs/tests/QUICK_TEST_v1.3.0.md)

### 🧪 测试
- [完整测试指南](./docs/tests/TEST_v1.3.0.md)
- [v1.2.0 测试](./docs/tests/TEST_v1.2.0.md)
- [v1.1.0 测试](./docs/tests/TEST_v1.1.0.md)

### 📖 学习
- [开发总结](./docs/summaries/DEVELOPMENT_SUMMARY.md)
- [优化记录](./docs/summaries/OPTIMIZATION_SUMMARY.md)
- [功能升级](./docs/summaries/FEATURE_UPGRADE.md)

---

## 💡 提示

- 🔍 **查看日志**: 遇到问题时第一步是查看输出日志 (`Cmd+Shift+U`)
- ⚡ **快速刷新**: 点击插件界面的 ⚡ 按钮可以从 GitHub 重新加载最新配置
- 📌 **书签推荐**: 将 [`docs/README.md`](./docs/README.md) 加入书签，方便快速访问所有文档
- 🎯 **收藏此文件**: 本文件是快速导航，推荐保存在常用位置

---

**版本**: v1.3.0  
**最后更新**: 2025-12-11  
**文档总数**: 16+

👉 **下一步**: 查看你需要的内容吧！
