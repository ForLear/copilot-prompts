# MCP 配置保护机制使用指南

## 🎯 解决的问题

### 问题1：配置覆盖
- **之前**：每次运行脚本都会完全覆盖 `copilot-instructions.md`
- **现在**：支持增量更新，保护自定义内容

### 问题2：跨项目引用
- **说明**：Copilot 只会读取当前项目的 `.github/copilot-instructions.md`
- **验证**：请确认你在正确的项目目录下工作

### 问题3：配置不完整  
- **之前**：vitasage配置方案的详细规则未被应用
- **现在**：自动加载并显示配置方案的核心规范

---

## 🛠️ 新功能

### 1. 配置保护（默认启用）

**自动保护自定义内容**：

```markdown
<!-- CUSTOM_START -->
## 🎯 VitaSage 特定规范

### 表格组件规范

1. **必须使用的属性**
   - `border` - 所有表格都要有边框
   - `highlight-current-row` - 高亮选中行
   - `v-loading="listLoading"` - 统一的加载状态变量名

2. **操作列规范**
   - 2个按钮：宽度200
   - 3个按钮：宽度250
   - 4个按钮：宽度300
<!-- CUSTOM_END -->
```

**下次更新时，这段内容会被保留！**

### 2. 配置方案支持

使用 `-c` 参数指定配置方案：

```bash
./setup-copilot.sh -c vitasage ../VitaSage/
```

这会：
- ✅ 自动加载 `configs/element-plus-vitasage.json`
- ✅ 在生成的文件中显示核心规范
- ✅ 提供详细规则的引用链接

---

## 📋 使用方法

### 首次配置（覆盖模式）

```bash
cd /Users/pailasi/Work/copilot-prompts
./setup-copilot.sh -c vitasage --force ../VitaSage/
```

参数说明：
- `-c vitasage` - 使用vitasage配置方案
- `--force` - 强制覆盖（首次使用）

### 更新配置（保护模式）

```bash
./setup-copilot.sh -c vitasage --update ../VitaSage/
```

参数说明：
- `--update` - 增量更新模式（保护CUSTOM内容）

### 添加自定义规范

1. 打开 `VitaSage/.github/copilot-instructions.md`
2. 添加你的规范，用标记包围：

```markdown
<!-- CUSTOM_START -->
你的自定义内容
<!-- CUSTOM_END -->
```

3. 下次更新时，这部分内容会被保留

---

## 🔧 立即修复 VitaSage 配置

### 步骤1：备份当前自定义内容

如果你之前手动添加了内容，先备份：

```bash
cp ../VitaSage/.github/copilot-instructions.md ../VitaSage/.github/copilot-instructions.md.backup
```

### 步骤2：重新生成配置

```bash
cd /Users/pailasi/Work/copilot-prompts
./setup-copilot.sh -c vitasage --force ../VitaSage/
```

### 步骤3：添加自定义规范

打开生成的文件，在末尾添加：

```markdown
<!-- CUSTOM_START -->
## 🎯 VitaSage 项目特定规范

### Element Plus 表格组件

#### 必须使用的属性
- `border` - 所有表格必须有边框（使用频率100%）
- `highlight-current-row` - 高亮选中行（使用频率100%）  
- `v-loading="listLoading"` - 加载状态（使用频率100%）
- `class="mt_10"` - 默认上边距

#### 列配置规范
- **序号列**: `type="index"`, `width="70"`, `label="$t('序号')"`
- **操作列**: `fixed="right"`, 宽度根据按钮数量：
  - 2个按钮 = 200
  - 3个按钮 = 250
  - 4个按钮 = 300

#### 分页组件
- 必须使用 `v-show="pageShow"` 控制显示
- 默认 `page-sizes="[10, 15, 20, 50, 100]"`

### LogicFlow 流程图

- 统一使用 `@logicflow/core` 和 `@logicflow/extension`
- 自定义节点放在 `src/components/logicflow/nodes/`
- 主题配置在 `src/components/logicflow/config/theme.ts`

### 权限系统

- 使用 `v-permission` 指令控制按钮显示
- 权限码存储在 `src/stores/permission.ts`
- 示例: `v-permission="['system:user:add']"`

### API 调用规范

- 统一使用 `src/api/` 目录下的接口
- 错误处理使用 `ElMessage.error()`
- 加载状态使用 `listLoading` 变量

<!-- CUSTOM_END -->
```

### 步骤4：验证配置

打开VS Code，在VitaSage项目中测试Copilot：

1. 创建一个新的Vue组件
2. 让Copilot生成一个表格
3. 检查是否自动添加了 `border` 和 `highlight-current-row`

---

## 📊 配置效果对比

### 之前（不完整）
```markdown
# 项目开发规范

- Vue 3 规范: get_relevant_standards({ fileType: "vue" })
- Element Plus 规范: get_relevant_standards({ imports: ["element-plus"] })
```

### 现在（完整）
```markdown
# 项目开发规范 - Copilot 指令

## 📦 配置方案

**方案ID**: vitasage
**名称**: VitaSage 工业配方系统配置
**描述**: 基于 VitaSage 项目实际使用习惯分析生成

### 表格组件规范

- ✅ **必须添加 border**
- ✅ **必须高亮当前行**
- ✅ **加载状态变量**: `listLoading`

## ⚠️ 强制工作流

**在进行任何代码生成或修改之前，必须先调用 MCP 工具加载相关规范！**
...

<!-- CUSTOM_START -->
你的自定义规范（会被保护）
<!-- CUSTOM_END -->
```

---

## 🚫 常见问题

### Q1: 为什么还是会引用其他项目的规范？

**A**: Copilot不会跨项目读取配置。如果你看到其他项目的内容，可能是：
- VS Code的上下文包含了其他项目文件
- 你在多项目工作区中，Copilot使用了全局上下文

**解决方法**：
1. 在VS Code中只打开VitaSage项目
2. 或者在单独的窗口中打开VitaSage

### Q2: 如何完全清除重新生成？

```bash
rm ../VitaSage/.github/copilot-instructions.md
./setup-copilot.sh -c vitasage --force ../VitaSage/
```

### Q3: 配置方案在哪里？

所有配置方案在 `copilot-prompts/configs/` 目录：
- `element-plus-vitasage.json` - VitaSage配置（225行详细规则）
- `flutter-recipe.md` - Flutter配置

---

## 📝 下一步优化建议

### 1. 改进配置方案加载

当前只显示了规则摘要，建议：
- 完整展开重要规则
- 添加代码示例
- 提供决策树

### 2. 智能规范推荐

根据当前编辑的文件类型，自动推荐最相关的规范。

### 3. 配置验证

添加配置验证工具，检查生成的代码是否符合规范。

---

**最后更新**: 2025-12-19  
**维护**: MTA团队

