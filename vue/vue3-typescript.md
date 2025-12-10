# Vue 3 + TypeScript 项目指南

适用于使用 Vue 3 Composition API + TypeScript 的现代前端项目

## 🎯 核心原则

1. **Composition API 优先**: 使用 `<script setup lang="ts">` 而非 Options API
2. **类型安全**: 所有数据必须有 TypeScript 类型定义，禁用 `any`
3. **响应式最佳实践**: 合理使用 `ref`/`reactive`/`computed`
4. **组件解耦**: Props 类型明确，emit 事件有类型约束

## 🔧 标准组件结构

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Props 定义
interface Props {
  modelValue: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Emits 定义
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const emit = defineEmits<Emits>()

// 状态
const localValue = ref('')

// 计算属性
const displayValue = computed(() => 
  localValue.value.toUpperCase()
)

// 方法
const handleChange = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}

// 生命周期
onMounted(() => {
  localValue.value = props.modelValue
})
</script>

<template>
  <div class="component">
    <input 
      v-model="localValue" 
      :disabled="disabled"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.component {
  /* 使用 scoped 样式 */
}
</style>
```

## ⚠️ 禁止模式

- ❌ 使用 `any` 类型
- ❌ Options API (`data()`, `methods`)
- ❌ 不定义 Props/Emits 类型
- ❌ 直接修改 Props 值
- ❌ 在 `<script>` 中使用 `this`

## 📋 代码审查清单

- [ ] 使用 `<script setup lang="ts">`
- [ ] Props 有完整的接口定义
- [ ] Emits 有类型约束
- [ ] 响应式变量使用正确的 API (ref/reactive)
- [ ] 计算属性使用 `computed()`
- [ ] 样式使用 `scoped`

## 🚀 常用模式

### 表单处理
```typescript
const form = reactive({
  name: '',
  email: ''
})

const validate = () => {
  if (!form.name.trim()) {
    return false
  }
  return true
}
```

### 异步数据加载
```typescript
const loading = ref(false)
const data = ref<DataType[]>([])

const fetchData = async () => {
  try {
    loading.value = true
    const response = await api.getData()
    data.value = response.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
```
