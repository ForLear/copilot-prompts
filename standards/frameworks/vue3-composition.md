# Vue 3 Composition API 核心规范

## 🎯 核心原则

1. **使用 `<script setup lang="ts">`** - 简洁的 Composition API 语法
2. **类型安全优先** - 所有 Props/Emits 必须有类型定义
3. **响应式最佳实践** - 正确使用 ref/reactive
4. **模板规范** - 避免复杂逻辑,禁止内联样式
5. **组件解耦** - 清晰的 Props/Emits 接口
6. **国际化优先** - 所有文案必须支持多语言（默认中英双语）

---

## 🌍 国际化规范（强制）

### 检测项目国际化方案

**开发新页面前，必须先检查项目是否已有国际化配置：**

1. **检查国际化文件**：
   ```bash
   # 常见位置
   src/locales/
   src/i18n/
   src/lang/
   
   # 常见文件
   messages.ts / messages.js
   index.ts / index.js
   zh-CN.ts, en-US.ts
   ```

2. **检查配置方式**：
   - **vue-i18n**: 查找 `createI18n()` 配置
   - **自定义方案**: 查找 `$t` 全局方法注册
   - **无配置**: 需要先建立国际化体系

### 方案一：vue-i18n（标准方案）

**适用场景**：项目使用 vue-i18n 库

```typescript
// i18n/index.ts
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

export const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

// main.ts
app.use(i18n)
```

```typescript
// i18n/zh-CN.ts
export default {
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    search: '搜索',
    reset: '重置'
  },
  user: {
    login: '登录',
    logout: '退出',
    username: '用户名',
    password: '密码'
  }
}
```

```vue
<template>
  <!-- ✅ 使用 $t() 函数 -->
  <el-button @click="handleSave">{{ $t('common.save') }}</el-button>
  <el-input :placeholder="$t('user.username')" />
  
  <!-- ✅ 动态参数 -->
  <p>{{ $t('message.welcome', { name: userName }) }}</p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// 在 script 中使用
const { t } = useI18n()
const message = t('common.confirm')
</script>
```

### 方案二：自定义国际化（轻量方案）

**适用场景**：项目有自定义的 $t 方法

```typescript
// locales/messages.ts
// 索引 0 为英文，索引 1 为中文
const messages: Record<string, [string, string]> = {
  确定: ['OK', '确定'],
  取消: ['Cancel', '取消'],
  保存: ['Save', '保存'],
  删除: ['Delete', '删除'],
  用户名: ['Username', '用户名'],
  密码: ['Password', '密码'],
  请输入用户名: ['Please enter username', '请输入用户名'],
}

export default messages
```

```typescript
// locales/locale.ts
import messages from './messages'

let currentLocale = 1 // 0: en, 1: zh

export const $t = (key: string): string => {
  const msg = messages[key]
  if (!msg) {
    console.warn(`Missing translation: ${key}`)
    return key
  }
  return msg[currentLocale]
}

export const setLocale = (locale: 'en' | 'zh') => {
  currentLocale = locale === 'en' ? 0 : 1
}
```

```vue
<template>
  <!-- ✅ 使用全局 $t() -->
  <el-button @click="handleSave">{{ $t('保存') }}</el-button>
  <el-input :placeholder="$t('请输入用户名')" />
  
  <!-- ✅ 表单标签 -->
  <el-form-item :label="$t('用户名')">
    <el-input v-model="form.username" />
  </el-form-item>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

// 获取全局 $t 方法
const { appContext } = getCurrentInstance()!
const $t = appContext.config.globalProperties.$t
</script>
```

### 国际化最佳实践

#### ✅ 必须国际化的内容

```vue
<template>
  <!-- 1. 按钮文字 -->
  <el-button>{{ $t('新增') }}</el-button>
  <el-button>{{ $t('查询') }}</el-button>
  
  <!-- 2. 表单标签 -->
  <el-form-item :label="$t('客户名称')">
  
  <!-- 3. 占位符 -->
  <el-input :placeholder="$t('请输入客户名称')" />
  
  <!-- 4. 表格列标题 -->
  <el-table-column :label="$t('订单编号')" />
  <el-table-column :label="$t('创建时间')" />
  
  <!-- 5. 弹窗标题 -->
  <el-dialog :title="$t('新增客户')">
  
  <!-- 6. 提示信息 -->
  <p>{{ $t('操作成功') }}</p>
  
  <!-- 7. 日期选择器 -->
  <el-date-picker
    :placeholder="$t('请选择日期')"
    :start-placeholder="$t('开始日期')"
    :end-placeholder="$t('结束日期')"
    :range-separator="$t('至')"
  />
  
  <!-- 8. 下拉选项（通过 computed） -->
  <el-select>
    <el-option
      v-for="item in statusOptions"
      :key="item.value"
      :label="item.label"
    />
  </el-select>
</template>

<script setup lang="ts">
// ✅ 下拉选项国际化
const statusOptions = computed(() => [
  { value: 'pending', label: $t('待处理') },
  { value: 'processing', label: $t('处理中') },
  { value: 'completed', label: $t('已完成') },
])

// ✅ 消息提示国际化
const handleSubmit = () => {
  ElMessage.success($t('保存成功'))
  ElMessage.error($t('保存失败'))
}

// ✅ 确认对话框国际化
const handleDelete = () => {
  ElMessageBox.confirm(
    $t('确认删除该记录吗'),
    $t('提示'),
    {
      confirmButtonText: $t('确定'),
      cancelButtonText: $t('取消')
    }
  )
}

// ✅ 表单验证规则国际化
const rules = {
  username: [
    { required: true, message: $t('请输入用户名'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: $t('请输入密码'), trigger: 'blur' },
    { min: 6, message: $t('密码至少6位字符'), trigger: 'blur' }
  ]
}
</script>
```

#### ❌ 禁止的做法

```vue
<template>
  <!-- ❌ 禁止：硬编码中文 -->
  <el-button>新增</el-button>
  <el-input placeholder="请输入用户名" />
  <el-form-item label="客户名称">
  
  <!-- ❌ 禁止：部分国际化 -->
  <el-button>{{ $t('保存') }}</el-button>  ✓
  <el-button>取消</el-button>  ✗ 遗漏
</template>

<script setup lang="ts">
// ❌ 禁止：消息提示未国际化
ElMessage.success('保存成功')

// ❌ 禁止：验证规则未国际化
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
}
</script>
```

### 国际化配置管理

#### 文件组织

```
src/
├── locales/           # 或 i18n/, lang/
│   ├── messages.ts    # 自定义方案：消息配置
│   ├── locale.ts      # 自定义方案：$t 方法
│   ├── zh-CN.ts       # vue-i18n：中文
│   ├── en-US.ts       # vue-i18n：英文
│   └── index.ts       # vue-i18n：配置入口
```

#### 添加新文案的步骤

1. **确认分类**：通用、业务模块、页面专用
2. **添加配置**：
   ```typescript
   // 自定义方案
   新增客户: ['Add Customer', '新增客户'],
   
   // vue-i18n
   customer: {
     add: '新增客户',
     edit: '编辑客户'
   }
   ```
3. **使用文案**：`{{ $t('新增客户') }}` 或 `{{ $t('customer.add') }}`
4. **测试验证**：切换语言检查显示是否正确

---

## 📐 模板代码格式规范

### 标签书写风格

根据项目不同，有两种标签书写风格：

#### 风格 A：单行书写（紧凑风格）

**特征**：开始标签和所有属性必须在同一行

```vue
<!-- ✅ 单行书写风格 - 所有标签 -->
<div class="container" :class="{ active: isActive }" @click="handleClick">
<el-button type="primary" :loading="loading" @click="submit">{{ $t('提交') }}</el-button>
<div v-for="item in list" :key="item.id" class="item" @click="select(item)">
<span v-show="isVisible" class="text">{{ content }}</span>

<!-- ❌ 禁止：多行书写 -->
<div 
  class="container"
  @click="handleClick">
  
<el-button
  type="primary"
  @click="submit">
```

**适用范围**：
- ⚠️ **所有 HTML 标签**（`<div>`, `<span>`, `<section>` 等）
- ⚠️ **所有 Vue 组件**（Element Plus、自定义组件等）
- ⚠️ **例外**：仅当单行过长（>120 字符）时可以换行

**检测方法**：
- .github/copilot-instructions.md 明确声明使用单行书写
- 或项目中 90% 以上标签使用单行书写
- 或用户明确要求紧凑风格

#### 风格 B：多行书写（标准风格）

**特征**：每个属性一行，便于阅读

```vue
<!-- ✅ 多行书写风格 -->
<div
  class="container"
  :class="{ active: isActive }"
  @click="handleClick">
  
<el-button
  type="primary"
  :loading="loading"
  @click="submit">
  {{ $t('提交') }}
</el-button>
```

**适用场景**：未明确要求单行书写的项目（默认）

---

## 组件基本结构

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 1. Props 定义
interface Props {
  modelValue: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// 2. Emits 定义
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const emit = defineEmits<Emits>()

// 3. 响应式状态
const localValue = ref('')
const isLoading = ref(false)

// 4. 计算属性
const displayValue = computed(() => 
  localValue.value.toUpperCase()
)

// 5. 方法
const handleChange = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}

// 6. 生命周期
onMounted(() => {
  localValue.value = props.modelValue
})
</script>

<template>
  <div class="my-component">
    <!-- ✅ 使用计算属性或方法处理复杂逻辑 -->
    <input 
      v-model="localValue" 
      :disabled="disabled"
      @change="handleChange"
    />
    
    <!-- ✅ 简单的条件渲染 -->
    <p v-if="isLoading">{{ $t('加载中') }}</p>
    
    <!-- ❌ 禁止：内联样式 -->
    <!-- <div style="color: red">错误示例</div> -->
    
    <!-- ❌ 禁止：复杂的模板表达式 -->
    <!-- <div>{{ items.filter(i => i.active).map(i => i.name).join(', ') }}</div> -->
    
    <!-- ✅ 正确：使用计算属性 -->
    <div>{{ activeItemNames }}</div>
  </div>
</template>

<style scoped>
/* ✅ 使用 scoped 样式替代内联样式 */
.my-component {
  /* 组件样式 */
}

.error-text {
  color: red;
}
</style>
```

## 组件通信

### v-model 双向绑定
```vue
<script setup lang="ts">
// ✅ 正确 - 使用 modelValue 约定
interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地状态同步
const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <input v-model="localValue" />
</template>
```

### 多个 v-model
```typescript
interface Props {
  modelValue: string
  count: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:count', value: number): void
}

// 使用: <MyComponent v-model="text" v-model:count="num" />
```

### Provide/Inject (跨层级通信)
```typescript
// 父组件
import { provide } from 'vue'

const theme = ref('dark')
provide('theme', theme)

// 子孙组件
import { inject } from 'vue'

const theme = inject<Ref<string>>('theme')
```

## Props 定义

### 基础 Props
```typescript
// ✅ 好 - 使用 interface
interface Props {
  title: string
  count: number
  user?: User
}

const props = defineProps<Props>()

// ❌ 坏 - 不使用类型
const props = defineProps({
  title: String,
  count: Number
})
```

### 默认值
```typescript
// ✅ 好 - 使用 withDefaults
interface Props {
  title: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false
})
```

## Emits 定义

```typescript
// ✅ 好 - 类型化的 emits
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: FormData): void
  (e: 'error', error: Error): void
}

const emit = defineEmits<Emits>()

// 使用
emit('update:modelValue', 'new value')
emit('submit', formData)
```

## 响应式数据

### ref vs reactive
```typescript
// ✅ 使用 ref - 基本类型和需要重新赋值的对象
const count = ref(0)
const user = ref<User | null>(null)

// ✅ 使用 reactive - 不需要重新赋值的对象
const form = reactive({
  name: '',
  email: '',
  age: 0
})

// ❌ 坏 - reactive 对象不能重新赋值
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // 失去响应式
```

### 计算属性
```typescript
// ✅ 好 - 只读计算属性
const fullName = computed(() => 
  `${firstName.value} ${lastName.value}`
)

// 可写计算属性
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value: string) => {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  }
})
```

## 生命周期

```typescript
import { 
  onMounted, 
  onUnmounted, 
  onUpdated,
  onBeforeMount 
} from 'vue'

// ✅ 好 - 在 setup 中使用生命周期钩子
onBeforeMount(() => {
  console.log('Before mount')
})

onMounted(() => {
  console.log('Mounted')
  // 初始化操作
})

onUpdated(() => {
  console.log('Updated')
})

onUnmounted(() => {
  console.log('Unmounted')
  // 清理操作
})
```

## 模板引用

```typescript
// ✅ 好 - 使用模板引用
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  inputRef.value?.focus()
})
```

```vue
<template>
  <input ref="inputRef" />
</template>
```

## Composables

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const doubled = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  return {
    count,
    doubled,
    increment,
    decrement
  }
}

// 在组件中使用
const { count, increment } = useCounter(10)
```

## ❌ 禁止模式

### 代码层面
```typescript
// ❌ Options API
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// ❌ 使用 this
const increment = () => {
  this.count++  // Composition API 中没有 this
}

// ❌ 直接修改 props
const handleClick = () => {
  props.value = 'new value'  // 禁止！应使用 emit
}

// ❌ reactive 重新赋值
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // 失去响应式

// ❌ 解构 reactive 对象
const { count } = reactive({ count: 0 })  // 失去响应式
```

### 模板层面
```vue
<template>
  <!-- ❌ 禁止内联样式 -->
  <div style="color: red; font-size: 14px">错误</div>
  
  <!-- ✅ 使用 class -->
  <div class="error-text">正确</div>
  
  <!-- ❌ 禁止复杂表达式 -->
  <div>{{ items.filter(i => i.active).map(i => i.name).join(', ') }}</div>
  
  <!-- ✅ 使用计算属性 -->
  <div>{{ activeItemNames }}</div>
  
  <!-- ❌ 禁止在模板中调用方法进行数据转换 -->
  <div v-for="item in items" :key="item.id">
    {{ formatDate(item.createdAt) }}  <!-- 每次渲染都会调用 -->
  </div>
  
  <!-- ✅ 使用计算属性缓存结果 -->
  <div v-for="item in formattedItems" :key="item.id">
    {{ item.formattedDate }}
  </div>
</template>
```

## ✅ 最佳实践总结

1. **组件结构顺序**: Props → Emits → 状态 → 计算属性 → 方法 → 生命周期
2. **使用 ref**: 基本类型、需要重新赋值的对象
3. **使用 reactive**: 不需要重新赋值的表单对象
4. **模板简洁**: 复杂逻辑提取到计算属性或方法
5. **禁止内联样式**: 始终使用 scoped CSS 或 class
6. **类型安全**: Props/Emits 必须有 TypeScript 类型
7. **响应式陷阱**: 避免解构 reactive,避免重新赋值 reactive
8. **CSS 嵌套写法**: 必须使用原生 CSS 嵌套语法，详见 [Vue CSS 嵌套规范](../patterns/vue-css-nesting.md)

---

## ⚠️ 重要：配置文件管理

### Copilot 配置 .gitignore

**推荐做法：**将自动生成的 `.github/copilot-instructions.md` 添加到 `.gitignore`

```gitignore
# Copilot 配置(自动生成)
.github/copilot-instructions.md
```

**原因：**
- ✅ 避免团队配置冲突
- ✅ 保持仓库清洁
- ✅ 允许个性化配置

**替代方案：**提交 `.github/copilot-instructions.template.md` 作为团队参考模板

**详细指南**: 参考 [Copilot .gitignore 通用指南](../../docs/guides/COPILOT_GITIGNORE_GUIDE.md)
  methods: {
    increment() {
      this.count++
    }
  }
}

// ❌ 坏 - 使用 this
const increment = () => {
  this.count++  // 在 Composition API 中没有 this
}

// ❌ 坏 - 直接修改 props
const handleClick = () => {
  props.value = 'new value'  // 禁止
}
```
