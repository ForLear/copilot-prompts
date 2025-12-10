# VitaSage - AI 开发指南

VitaSage 是企业级工业配方管理系统 (Vue 3 + TypeScript + Element Plus + LogicFlow)

## 🎯 核心原则

1. **最小改动**: 只修改直接相关的代码，避免全局重构
2. **类型安全**: 所有代码必须有 TypeScript 类型定义，禁用 `any`
3. **国际化强制**: 所有 UI 文本必须使用 `$t()` 包裹
4. **错误处理**: 所有异步操作必须有 try-catch-finally

## 🔧 关键架构模式

### API 层 (强制遵守)

**API 定义**: 所有接口必须在 `src/api/api.ts` 的 `interfaceUrl` 对象中声明
```typescript
const interfaceUrl = (() => {
  let urlList = {
    getUserPageList: '/User/getUserPageList',  // 驼峰命名
    insertUser: '/User/insertUser',
  }
  return urlList
})()
```

**API 调用**: 必须使用 `api.$methodName`，禁止直接使用 axios
```typescript
import api from '@api'  // 路径别名

const getList = async () => {
  try {
    listLoading.value = true
    const agin = await api.$getUserPageList(params)
    if (agin.success) {
      list.value = agin?.Data?.data || []  // 使用可选链 + 默认值
      total.value = agin?.Data?.total_count || 0
    }
  } catch (err) {
    console.error(err)
  } finally {
    listLoading.value = false  // 必须清理状态
  }
}
```

**标准响应结构**: `{ success: boolean, Data: any, msg: string }`

### 组件开发标准

**必须使用 Composition API** (`<script setup lang="ts">`)
```typescript
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@api'

// 国际化 (必须)
const { appContext } = getCurrentInstance()!
const $t = appContext.config.globalProperties.$t

// 类型定义 (必须)
interface FormData {
  id?: number
  name: string
}

// 响应式状态
const listLoading = ref(false)
const list = ref<FormData[]>([])

// CRUD 操作示例
const deleteRow = async (row: FormData) => {
  try {
    await ElMessageBox.confirm($t('确认删除？'), $t('警告'), { type: 'warning' })
    const agin = await api.$deleteItem({ id: row.id })
    if (agin.success) {
      ElMessage.success($t('删除成功'))
      await getList()
    }
  } catch (err) {
    if (err !== 'cancel') console.error(err)
  }
}
```

### 国际化规范

**所有文本必须国际化**:
```vue
<!-- ✅ 正确 -->
<el-button>{{ $t('确认') }}</el-button>
<el-table-column :label="$t('名称')" />

<!-- ❌ 错误 -->
<el-button>确认</el-button>
```

**动态文本映射**:
```typescript
{{ { 0: $t('输入参数'), 1: $t('输出参数') }[row.obj_type] }}
```

### 路径别名

```typescript
@api    → src/api/index
@com    → src/components
@stores → src/stores
@       → src/
```

## 🔧 项目特性

### LogicFlow 流程图系统

- 节点类型: `start`, `end`, `action`, `transition`, `unit`, `operation`, `phase`, `branch`, `parallelBranch` 等
- 流程图校验: 使用 `src/utils/flowValidator.ts` 进行连通性、回路、孤立节点检测
- 参考: `src/components/flow/Flow.vue`

### 组件注册

全局组件在 `src/components/index.ts` 注册:
```typescript
app.component('Expression', Expression)
   .component('Flow', Flow)
```

### 分页标准

```typescript
interface PageQuery {
  page_index: number  // 从 1 开始
  page_size: number
  [key: string]: any
}
```

## ⚠️ 禁止模式

- ❌ 直接使用 `axios.post()`
- ❌ 硬编码文本 (不使用 `$t()`)
- ❌ 使用 `any` 类型
- ❌ 选项式 API (`data()`, `methods`)
- ❌ 不处理错误或不清理 loading 状态
- ❌ 借机重构无关代码

## 📋 代码审查清单

- [ ] 所有函数参数/返回值有类型定义
- [ ] API 调用使用 `api.$method` 且有 try-catch-finally
- [ ] 所有文本使用 `$t()` 国际化
- [ ] 使用 `<script setup lang="ts">`
- [ ] 对话框关闭时重置表单
- [ ] 删除操作有确认提示

## 🚀 开发命令

```bash
npm run dev          # 开发模式
npm run build_dev    # 开发环境构建
npm run build_prod   # 生产环境构建
npm run type-check   # 类型检查
```

## 📚 参考示例

- CRUD 页面: `src/views/classMain/classConfig/UnitClass.vue`
- 表达式构建: `src/components/expression/index.vue`
- 流程图编辑: `src/components/flow/Flow.vue`
