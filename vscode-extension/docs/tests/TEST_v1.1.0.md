# v1.1.0 快速测试指南

## 📋 测试步骤

### 1. 重新加载 VS Code
```
Cmd/Ctrl + Shift + P → Reload Window
```

### 2. 打开侧边栏
- 点击左侧 Copilot Prompts 图标

### 3. 测试勾选立即生效

#### 测试 A: 单个勾选
1. ☑️ 勾选 "VitaSage Agent"
2. 预期: 立即弹窗 "✅ 配置已自动应用 (1 个)"
3. 验证: `cat ~/.vscode/copilot-instructions.md` 能看到 VitaSage 内容

#### 测试 B: 取消勾选
1. ☐ 取消 "VitaSage Agent"
2. 预期: 立即弹窗 "✅ 配置已自动应用 (0 个)"
3. 验证: `cat ~/.vscode/copilot-instructions.md` 应该为空或不包含 VitaSage

#### 测试 C: 批量勾选
1. 点击 "Select All" 按钮
2. 预期: 所有 checkbox 被勾选，弹窗显示 "✅ 已全选并应用 (8 个)"
3. 验证: 配置文件包含所有 8 个 prompts

#### 测试 D: 清空
1. 点击 "Clear All" 按钮
2. 预期: 所有 checkbox 取消勾选，弹窗显示 "✅ 已清空并应用配置"
3. 验证: 配置文件为空

### 4. 测试界面简洁性
- ✅ checkbox 右边**没有**圆圈图标
- ✅ 只显示 checkbox 和文本

### 5. 测试状态同步
1. 勾选 3 个 agents
2. 关闭侧边栏
3. 重新打开侧边栏
4. 预期: 之前勾选的 3 个仍然保持勾选状态
5. 查看状态栏: 应显示 "$(file-code) Copilot: 3"

---

## ✅ 预期结果

| 操作 | 预期行为 |
|------|---------|
| 勾选 1 个 | 弹窗 "✅ 配置已自动应用 (1 个)" |
| 取消勾选 | 弹窗 "✅ 配置已自动应用 (X 个)" |
| Select All | 弹窗 "✅ 已全选并应用 (8 个)" |
| Clear All | 弹窗 "✅ 已清空并应用配置" |
| 状态栏 | 显示当前勾选数量 |
| 配置文件 | 实时同步勾选内容 |

---

## 🐛 如果遇到问题

### 问题 1: 勾选后没有弹窗
**解决**: 
1. 重新加载窗口 (`Reload Window`)
2. 检查扩展是否正确安装: `code --list-extensions | grep copilot`

### 问题 2: 配置文件没有更新
**解决**:
```bash
# 检查全局配置文件
cat ~/.vscode/copilot-instructions.md

# 如果不存在，手动创建目录
mkdir -p ~/.vscode
```

### 问题 3: 旧版本还在运行
**解决**:
```bash
# 卸载旧版本
code --uninstall-extension forlear.copilot-prompts-manager

# 重新安装新版本
cd /Users/pailasi/Work/copilot-prompts/vscode-extension
code --install-extension copilot-prompts-manager-1.1.0.vsix --force

# 重新加载窗口
```

---

## 📊 验证命令

```bash
# 1. 查看扩展版本
code --list-extensions --show-versions | grep copilot-prompts

# 2. 查看全局配置
cat ~/.vscode/copilot-instructions.md

# 3. 监听配置变化 (另一个终端)
watch -n 1 "wc -l ~/.vscode/copilot-instructions.md"
```

---

**测试完成后，请尝试生成代码验证 prompts 是否生效！** 🎉
