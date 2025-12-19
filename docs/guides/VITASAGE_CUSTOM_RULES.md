# VitaSage 自定义规范模板

> 将此内容复制到 VitaSage/.github/copilot-instructions.md 文件末尾

```markdown
<!-- CUSTOM_START -->

## 🎯 VitaSage 项目特定规范

### 📊 Element Plus 表格组件

#### 必须使用的属性
- `border` - 所有表格必须有边框（使用频率 100%）
- `highlight-current-row` - 高亮选中行（使用频率 100%）
- `v-loading="listLoading"` - 统一的加载状态变量名（使用频率 100%）
- `class="mt_10"` - 默认上边距样式

#### 列配置规范
- **序号列**: `type="index"`, `width="70"`, `label="$t('序号')"`
- **操作列**: `fixed="right"`, 宽度根据按钮数量：
  - 2个按钮 = 200px
  - 3个按钮 = 250px
  - 4个按钮 = 300px

#### 分页组件
- 必须使用 `v-show="pageShow"` 控制显示
- 默认 `page-sizes="[10, 15, 20, 50, 100]"`
- 布局：`layout="total, sizes, prev, pager, next, jumper"`

---

### 🎨 LogicFlow 流程图

#### 目录结构
- 自定义节点：`src/components/logicflow/nodes/`
- 主题配置：`src/components/logicflow/config/theme.ts`
- 统一使用 `@logicflow/core` 和 `@logicflow/extension`

#### 节点开发规范
- 必须实现 Model-View-Component 三层架构
- 连接规则在 Model 的 `getConnectedSourceRules()` 中定义
- 锚点位置在 `getDefaultAnchor()` 中返回

---

### 🔐 权限系统

#### 权限指令使用
- 使用 `v-permission` 指令控制按钮显示
- 权限码存储在 `src/stores/permission.ts`
- 格式示例: `v-permission="['system:user:add']"`

```vue
<!-- ✅ 正确示例 -->
<el-button v-permission="['system:user:edit']">编辑</el-button>
<el-button v-permission="['system:user:delete']">删除</el-button>
```

---

### 🌐 国际化规范（强制）

#### 所有文本必须国际化
```vue
<!-- ❌ 错误 -->
<el-button>保存</el-button>
<el-table-column label="用户名" />

<!-- ✅ 正确 -->
<el-button>{{ $t('保存') }}</el-button>
<el-table-column :label="$t('用户名')" />
```

#### 消息提示国际化
```typescript
// ❌ 错误
ElMessage.success('操作成功')

// ✅ 正确
ElMessage.success($t('操作成功'))
```

#### 表单验证国际化
```typescript
// ❌ 错误
rules: {
  name: [{ required: true, message: '请输入用户名' }]
}

// ✅ 正确
rules: {
  name: [{ required: true, message: $t('请输入用户名') }]
}
```

---

### 🔌 API 调用规范

#### 统一使用 API 目录
- 所有接口定义在 `src/api/index.ts`
- 使用别名 `@api` 导入：`import api from '@api'`

#### 标准调用模式
```typescript
const getList = async () => {
  try {
    listLoading.value = true
    const agin = await api.$getUserPageList(params)
    if (agin.success) {
      list.value = agin?.Data?.data || []
      total.value = agin?.Data?.total_count || 0
    }
  } catch (err) {
    console.error(err)
    ElMessage.error($t('加载失败'))
  } finally {
    listLoading.value = false
  }
}
```

#### 错误处理
- 统一使用 `ElMessage.error()` 显示错误
- 必须使用 try-catch-finally 三位一体
- `finally` 中清理 loading 状态

---

### 🎭 el-drawer 表格样式规范

#### 输入控件样式适配
```scss
:deep(.el-drawer) {
  .el-table__body {
    /* 禁用状态：透明背景 */
    .el-input__wrapper,
    .el-select .el-input__wrapper {
      background-color: transparent !important;
      box-shadow: none !important;
    }
    
    /* 启用状态：使用CSS变量 */
    .el-input:not(.is-disabled) .el-input__wrapper,
    .el-select:not(.is-disabled) .el-input__wrapper {
      background-color: var(--el-fill-color-blank) !important;
      box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
    }
  }
}
```

---

### 🔄 表格编辑取消逻辑

#### 必须维护备份数据
```typescript
// 1. 获取数据时创建备份
const list = ref<any[]>([])
const subList = ref<any[]>([])  // 备份

const getList = async () => {
  const agin = await api.$getList(params)
  if (agin.success) {
    list.value = agin.Data
    subList.value = JSON.parse(JSON.stringify(agin.Data))  // 深拷贝
  }
}

// 2. 取消方法
const cancelEdit = () => {
  list.value = JSON.parse(JSON.stringify(subList.value))
  editMode.value = true
}

// 3. 提交成功后更新备份
const submit = async () => {
  const agin = await api.$update({ list: list.value })
  if (agin.success) {
    subList.value = JSON.parse(JSON.stringify(list.value))
    editMode.value = true
  }
}
```

---

### ⚠️ 禁止模式

- ❌ **硬编码中文文本**（绝对禁止！必须用 `$t()`）
- ❌ `axios.post()` 直接调用（必须通过 `@api`）
- ❌ `any` 类型（必须明确类型）
- ❌ Options API（必须用 Composition API）
- ❌ 不清理 loading 状态
- ❌ 无关代码重构
- ❌ **擅自更换组件类型**（如将 el-cascader 换成 el-select）

---

### 📋 代码审查清单

生成代码前必须确认：
- [ ] API 使用 `api.$method` 格式
- [ ] 有 try-catch-finally 完整错误处理
- [ ] **所有中文文本已使用 $t()**
- [ ] **所有翻译键已在 messages.ts 中定义**
- [ ] `<script setup lang="ts">` 声明
- [ ] 函数参数/返回值有明确类型
- [ ] 删除操作有确认对话框
- [ ] **ElMessage/ElMessageBox 文本已国际化**
- [ ] **表单验证 message 已国际化**
- [ ] **表格列标题已国际化**
- [ ] **按钮文本已国际化**
- [ ] **输入框占位符已国际化**

---

**维护**: MTA工作室  
**最后更新**: 2025-12-19  

<!-- CUSTOM_END -->
```

## 使用说明

1. **查看当前配置**：
   ```bash
   code /Users/pailasi/Work/VitaSage/.github/copilot-instructions.md
   ```

2. **在文件末尾添加**上述自定义规范

3. **重新生成配置**（会保留自定义内容）：
   ```bash
   cd /Users/pailasi/Work/copilot-prompts/mcp-server
   ./regenerate-vitasage.sh
   ```

4. **验证配置**：在VitaSage项目中让Copilot生成一个表格，检查是否符合规范
