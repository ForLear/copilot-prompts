# 配置系统扩展指南

## 🎯 系统可扩展性

Copilot Prompts 配置系统是**完全可扩展的**，可以为任何项目创建自定义配置。

### 当前支持的项目类型

1. ✅ **VitaSage** - Vue 3 + Element Plus + LogicFlow
2. ✅ **Flutter** - Dart + Flutter框架
3. ✅ **微信小程序** - 小程序 + 云开发
4. ✅ **标准Web项目** - Vue/React/Angular

---

## 📦 为新项目创建配置

### 方法1：使用通用脚本（推荐）

```bash
cd /Users/pailasi/Work/copilot-prompts/mcp-server

# 编译（首次使用）
npm run build

# 为任何项目生成配置
node generate-project-config.cjs <项目路径> [配置ID] [agents]
```

**示例**：

```bash
# VitaSage（带配置方案）
node generate-project-config.cjs /Users/pailasi/Work/VitaSage vitasage vitasage,vue3,logicflow

# Flutter项目
node generate-project-config.cjs /Users/pailasi/Work/my_flutter flutter-recipe flutter

# 微信小程序
node generate-project-config.cjs /Users/pailasi/Work/MTA-Market wechat wechat-miniprogram

# weipin项目（自动匹配）
node generate-project-config.cjs /Users/pailasi/Work/weipin
```

---

### 方法2：创建项目专用脚本

仿照 `regenerate-vitasage.sh` 创建其他项目的脚本：

```bash
# 创建 regenerate-weipin.sh
cat > regenerate-weipin.sh << 'EOF'
#!/bin/bash
set -e
echo "🔄 重新生成 weipin 项目配置..."
npm run build
node generate-project-config.cjs /Users/pailasi/Work/weipin standard vue3,pinia
echo "✅ weipin 配置已更新！"
EOF

chmod +x regenerate-weipin.sh
```

---

## 🎨 创建自定义配置方案

### 步骤1：创建配置JSON文件

在 `configs/` 目录创建配置文件：

```bash
# 示例：为weipin项目创建配置方案
cat > configs/element-plus-weipin.json << 'EOF'
{
  "configId": "weipin",
  "name": "weipin 标准配置",
  "description": "基于 weipin 项目使用习惯生成",
  "analyzedFrom": "/Users/pailasi/Work/weipin",
  "analyzedAt": "2025-12-19",
  "version": "1.0.0",
  "maintainer": "你的团队",
  
  "rules": {
    "button": {
      "type": {
        "primary": {
          "frequency": 80,
          "description": "主要操作按钮使用 primary"
        }
      }
    },
    "form": {
      "labelWidth": {
        "default": "100px",
        "description": "表单label默认宽度"
      }
    }
  }
}
EOF
```

### 步骤2：使用配置方案

```bash
node generate-project-config.cjs /Users/pailasi/Work/weipin weipin vue3,pinia
```

生成的配置会自动包含你定义的规则摘要。

---

## 🔧 创建自定义Agent

### 步骤1：创建Agent文件

在 `agents/` 目录创建新的 `.agent.md` 文件：

```bash
cat > agents/weipin.agent.md << 'EOF'
---
description: 'weipin 项目专用代理'
tools: ['edit', 'search', 'runCommands']
---

# weipin 专用开发代理

## ⚠️ 强制工作流

**在编写任何代码前，必须先调用 MCP 工具：**

\`\`\`
get_relevant_standards({ fileType: "vue" })
\`\`\`

## 核心原则

1. **类型安全** - 禁用 any 类型
2. **代码一致性** - 遵循项目风格
3. **错误处理** - 完善的异常处理

## 项目特定规范

### API 调用
- 统一使用 axios 实例
- 错误处理使用 ElMessage

### 组件规范
- 使用 Composition API
- Props 必须有类型定义

---
EOF
```

### 步骤2：使用自定义Agent

```bash
node generate-project-config.cjs /Users/pailasi/Work/weipin weipin weipin,vue3
```

---

## 🚀 快速配置模板

### Vue 3 + Element Plus 项目

```bash
node generate-project-config.cjs \
  /path/to/project \
  standard \
  vue3,pinia,i18n
```

### React 项目

```bash
node generate-project-config.cjs \
  /path/to/project \
  standard \
  react,typescript
```

### 微信小程序

```bash
node generate-project-config.cjs \
  /path/to/project \
  wechat \
  wechat-miniprogram
```

### Flutter 项目

```bash
node generate-project-config.cjs \
  /path/to/project \
  flutter-recipe \
  flutter
```

---

## 📋 所有可用的Agents

查看 `agents/` 目录：

```bash
ls agents/
# flutter.agent.md
# i18n.agent.md
# logicflow.agent.md
# vitasage.agent.md
# vue3.agent.md
# wechat-miniprogram.agent.md
```

**使用时去掉 `.agent.md` 后缀**：
- `flutter.agent.md` → `flutter`
- `vue3.agent.md` → `vue3`
- `i18n.agent.md` → `i18n`

---

## 🔄 配置更新策略

### 首次生成（覆盖模式）

```bash
# 会完全覆盖现有配置
node generate-project-config.cjs /path/to/project configId agents
```

### 更新配置（保护模式，默认）

系统默认使用 `merge` 模式，会自动保护 `CUSTOM_START/CUSTOM_END` 之间的内容。

### 强制覆盖

如果需要完全重新生成，修改脚本中的 `updateMode`:

```javascript
const result = await generateConfig({
  projectPath,
  updateMode: 'overwrite',  // 强制覆盖
  // ...
});
```

---

## 💡 最佳实践

### 1. 为每个主要项目创建配置方案

```
configs/
├── element-plus-vitasage.json    # VitaSage专用
├── element-plus-weipin.json      # weipin专用
├── flutter-recipe.json           # Flutter项目
└── wechat-miniprogram.json       # 小程序项目
```

### 2. 为每个项目创建快速脚本

```
mcp-server/
├── regenerate-vitasage.sh
├── regenerate-weipin.sh
├── regenerate-flutter.sh
└── regenerate-miniprogram.sh
```

### 3. 使用自定义规范

每个项目的配置文件末尾添加：

```markdown
<!-- CUSTOM_START -->
你的项目特定规范
<!-- CUSTOM_END -->
```

---

## 🎯 示例：为weipin项目创建完整配置

### 1. 创建配置方案

```bash
cat > configs/element-plus-weipin.json << 'EOF'
{
  "configId": "weipin",
  "name": "weipin 标准配置",
  "description": "基于 weipin 项目使用习惯",
  "version": "1.0.0",
  "maintainer": "你的团队",
  "rules": {
    "table": {
      "border": { "required": true },
      "stripe": { "required": true }
    }
  }
}
EOF
```

### 2. 创建快速脚本

```bash
cat > mcp-server/regenerate-weipin.sh << 'EOF'
#!/bin/bash
set -e
echo "🔄 重新生成 weipin 项目配置..."
npm run build
node generate-project-config.cjs \
  /Users/pailasi/Work/weipin \
  weipin \
  vue3,pinia,i18n
echo "✅ weipin 配置已更新！"
EOF

chmod +x mcp-server/regenerate-weipin.sh
```

### 3. 生成配置

```bash
cd mcp-server
./regenerate-weipin.sh
```

### 4. 添加自定义规范

编辑 `/Users/pailasi/Work/weipin/.github/copilot-instructions.md`，在末尾添加：

```markdown
<!-- CUSTOM_START -->
## weipin 项目规范

### 路由配置
- 使用 vue-router
- 路由守卫在 src/router/guards.ts

### 状态管理
- 使用 pinia
- store 文件在 src/stores/
<!-- CUSTOM_END -->
```

---

## 🎉 总结

✅ **完全可扩展** - 可为任何项目创建配置  
✅ **灵活配置** - 支持配置方案、自定义Agent  
✅ **保护机制** - 自动保护自定义内容  
✅ **快速生成** - 一行命令生成完整配置  

**需要帮助？** 参考现有的 vitasage、flutter、wechat-miniprogram 配置作为模板。
