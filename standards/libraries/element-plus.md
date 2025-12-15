# Element Plus 组件库使用规范

> 基于 Element Plus 2.x 版本的最佳实践指南

## 🎯 核心原则

1. **按需导入** - 减小打包体积
2. **类型安全** - 充分利用 TypeScript 类型
3. **国际化优先** - 所有文本使用 i18n
4. **响应式设计** - 合理使用 v-loading、v-model
5. **用户体验** - 提供清晰的反馈和确认

---

## 📦 项目配置

### 按需导入（推荐）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

### 完整导入（不推荐用于生产环境）

```typescript
// main.ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

app.use(ElementPlus, {
  locale: zhCn
})
```

---

## 📋 表单 (el-form)

### 基础表单与验证

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getCurrentInstance } from 'vue'

// ✅ 国际化
const { appContext } = getCurrentInstance()!
const $t = appContext.config.globalProperties.$t

interface FormData {
  name: string
  email: string
  age: number
  status: 'active' | 'inactive'
}

const formRef = ref<FormInstance>()

const form = reactive<FormData>({
  name: '',
  email: '',
  age: 0,
  status: 'active'
})

// ✅ 验证规则使用国际化
const rules: FormRules<FormData> = {
  name: [
    { required: true, message: $t('请输入姓名'), trigger: 'blur' },
    { min: 2, max: 20, message: $t('长度在 2 到 20 个字符'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: $t('请输入邮箱'), trigger: 'blur' },
    { type: 'email', message: $t('请输入正确的邮箱'), trigger: 'blur' }
  ],
  age: [
    { required: true, message: $t('请输入年龄'), trigger: 'blur' },
    { type: 'number', min: 0, max: 150, message: $t('年龄必须在0-150之间'), trigger: 'blur' }
  ]
}

// ✅ 标准提交模式
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // 验证通过，执行提交
    console.log('Submit:', form)
    ElMessage.success($t('提交成功'))
  } catch (error) {
    console.error('验证失败:', error)
    ElMessage.warning($t('请检查表单'))
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    label-position="right"
  >
    <!-- ✅ 所有 label 使用 $t() -->
    <el-form-item :label="$t('姓名')" prop="name">
      <el-input 
        v-model="form.name" 
        :placeholder="$t('请输入姓名')" 
      />
    </el-form-item>
    
    <el-form-item :label="$t('邮箱')" prop="email">
      <el-input 
        v-model="form.email" 
        type="email"
        :placeholder="$t('请输入邮箱')" 
      />
    </el-form-item>
    
    <el-form-item :label="$t('年龄')" prop="age">
      <el-input-number 
        v-model="form.age" 
        :min="0" 
        :max="150" 
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">
        {{ $t('提交') }}
      </el-button>
      <el-button @click="resetForm">
        {{ $t('重置') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>
```

### 自定义验证规则

```typescript
// 自定义验证器
const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error($t('请输入手机号')))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error($t('请输入正确的手机号')))
  } else {
    callback()
  }
}

const rules = {
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
}
```

---

## 📊 表格 (el-table)

### 标准表格模式

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ElMessage, ElMessageBox } from 'element-plus'

interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
}

const tableData = ref<User[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ✅ 标准 API 调用模式
const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    const res = await api.$getUserList(params)
    if (res.success) {
      tableData.value = res.Data?.data || []
      total.value = res.Data?.total_count || 0
    }
  } catch (err) {
    console.error(err)
    ElMessage.error($t('获取数据失败'))
  } finally {
    loading.value = false
  }
}

// ✅ 编辑操作
const handleEdit = (row: User) => {
  console.log('Edit:', row)
  // 打开编辑对话框...
}

// ✅ 删除操作 - 必须有确认
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      $t('确认删除用户') + ` ${row.name}?`,
      $t('警告'),
      {
        confirmButtonText: $t('确定'),
        cancelButtonText: $t('取消'),
        type: 'warning'
      }
    )
    
    // 执行删除
    await api.$deleteUser({ id: row.id })
    ElMessage.success($t('删除成功'))
    fetchData() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error($t('删除失败'))
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <el-table
      :data="tableData"
      v-loading="loading"
      stripe
      border
      highlight-current-row
    >
      <!-- ✅ 序号列 -->
      <el-table-column 
        type="index" 
        :label="$t('序号')" 
        width="70" 
      />
      
      <!-- ✅ 数据列 - label 必须国际化 -->
      <el-table-column 
        prop="name" 
        :label="$t('姓名')" 
        min-width="120"
      />
      
      <el-table-column 
        prop="email" 
        :label="$t('邮箱')" 
        min-width="180"
      />
      
      <!-- ✅ 状态列 - 使用映射 -->
      <el-table-column :label="$t('状态')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ { active: $t('激活'), inactive: $t('停用') }[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- ✅ 时间列 - 格式化显示 -->
      <el-table-column 
        :label="$t('创建时间')" 
        width="180"
      >
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      
      <!-- ✅ 操作列 - fixed -->
      <el-table-column 
        fixed="right"
        :label="$t('操作')" 
        width="180"
      >
        <template #default="{ row }">
          <el-button 
            link 
            type="primary" 
            @click="handleEdit(row)"
          >
            {{ $t('编辑') }}
          </el-button>
          <el-button 
            link 
            type="danger" 
            @click="handleDelete(row)"
          >
            {{ $t('删除') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- ✅ 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchData"
      @current-change="handlePageChange"
    />
  </div>
</template>
```

### 可编辑表格模式

```vue
<script setup lang="ts">
// ✅ 编辑模式：需要备份数据用于取消
const editMode = ref(false)
const tableData = ref<Item[]>([])
const backupData = ref<Item[]>([])  // 备份数据

const fetchData = async () => {
  const res = await api.$getList()
  if (res.success) {
    tableData.value = res.Data
    // ✅ 深拷贝备份
    backupData.value = JSON.parse(JSON.stringify(res.Data))
  }
}

// ✅ 取消编辑 - 恢复备份
const cancelEdit = () => {
  tableData.value = JSON.parse(JSON.stringify(backupData.value))
  editMode.value = false
}

// ✅ 提交编辑
const submitEdit = async () => {
  try {
    const res = await api.$updateList({ list: tableData.value })
    if (res.success) {
      // ✅ 成功后更新备份
      backupData.value = JSON.parse(JSON.stringify(tableData.value))
      editMode.value = false
      ElMessage.success($t('保存成功'))
    }
  } catch (err) {
    ElMessage.error($t('保存失败'))
  }
}
</script>

<template>
  <div>
    <el-button 
      v-if="!editMode" 
      @click="editMode = true"
    >
      {{ $t('编辑') }}
    </el-button>
    <template v-else>
      <el-button type="primary" @click="submitEdit">
        {{ $t('保存') }}
      </el-button>
      <el-button @click="cancelEdit">
        {{ $t('取消') }}
      </el-button>
    </template>
    
    <el-table :data="tableData">
      <el-table-column :label="$t('名称')">
        <template #default="{ row }">
          <!-- ✅ 编辑模式下显示输入框 -->
          <el-input 
            v-if="editMode" 
            v-model="row.name" 
          />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

---

## 🎯 选择器 (el-select / el-cascader)

### 基础选择器

```vue
<script setup lang="ts">
const selectedValue = ref('')
const options = ref([
  { label: $t('选项1'), value: '1' },
  { label: $t('选项2'), value: '2' }
])
</script>

<template>
  <!-- ✅ 基础选择器 -->
  <el-select 
    v-model="selectedValue" 
    :placeholder="$t('请选择')"
    clearable
    filterable
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
```

### 级联选择器（重要）

```vue
<script setup lang="ts">
// ✅ 级联选择器配置
const cascaderValue = ref([])
const cascaderProps = {
  lazy: true,
  checkStrictly: true,  // ✅ 允许选中任意级别（包括父节点）
  lazyLoad: async (node: any, resolve: any) => {
    const { level, value } = node
    // 异步加载子节点
    const children = await loadChildren(value)
    resolve(children)
  }
}

// ⚠️ 常见错误
// checkStrictly: false  // 错误！只能选择叶子节点
</script>

<template>
  <el-cascader
    v-model="cascaderValue"
    :options="options"
    :props="cascaderProps"
    :placeholder="$t('请选择')"
    clearable
  />
</template>
```

---

## 💬 对话框 (el-dialog / el-drawer)

### 标准对话框

```vue
<script setup lang="ts">
const dialogVisible = ref(false)
const formData = reactive({
  name: '',
  email: ''
})

const openDialog = () => {
  dialogVisible.value = true
}

// ✅ 关闭前重置表单
const handleClose = () => {
  Object.assign(formData, { name: '', email: '' })
  dialogVisible.value = false
}

const handleConfirm = async () => {
  try {
    await api.$submit(formData)
    ElMessage.success($t('操作成功'))
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error($t('操作失败'))
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('对话框标题')"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="100px">
      <el-form-item :label="$t('姓名')">
        <el-input v-model="formData.name" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ $t('取消') }}
      </el-button>
      <el-button type="primary" @click="handleConfirm">
        {{ $t('确定') }}
      </el-button>
    </template>
  </el-dialog>
</template>
```

### 抽屉 (el-drawer)

```vue
<template>
  <el-drawer
    v-model="drawerVisible"
    :title="$t('详情')"
    direction="rtl"
    size="40%"
  >
    <!-- 内容 -->
  </el-drawer>
</template>

<style scoped>
/* ✅ Drawer 中表格样式优化 */
:deep(.el-drawer) {
  .el-table__body {
    /* 禁用状态：透明背景 */
    .el-input__wrapper,
    .el-select .el-input__wrapper {
      background-color: transparent !important;
      box-shadow: none !important;
    }
    
    /* 启用状态：使用主题变量 */
    .el-input:not(.is-disabled) .el-input__wrapper,
    .el-select:not(.is-disabled) .el-input__wrapper {
      background-color: var(--el-fill-color-blank) !important;
      box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
    }
  }
}
</style>
```

---

## 📅 日期选择器 (el-date-picker)

```vue
<script setup lang="ts">
// ✅ 日期范围选择
const dateRange = ref<[string, string]>(['', ''])

// 快捷选项
const shortcuts = [
  {
    text: $t('最近一周'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: $t('最近一个月'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]
</script>

<template>
  <el-date-picker
    v-model="dateRange"
    type="datetimerange"
    :shortcuts="shortcuts"
    range-separator="至"
    :start-placeholder="$t('开始日期')"
    :end-placeholder="$t('结束日期')"
    format="YYYY-MM-DD HH:mm:ss"
    value-format="YYYY-MM-DD HH:mm:ss"
  />
</template>
```

---

## 💬 消息提示

### ElMessage

```typescript
import { ElMessage } from 'element-plus'

// ✅ 正确：所有文本国际化
ElMessage.success($t('操作成功'))
ElMessage.error($t('操作失败'))
ElMessage.warning($t('请检查输入'))
ElMessage.info($t('提示信息'))

// ❌ 错误：硬编码中文
ElMessage.success('操作成功')  // 禁止！
```

### ElMessageBox

```typescript
import { ElMessageBox } from 'element-plus'

// ✅ 确认对话框
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      $t('确认删除这条记录吗？'),
      $t('警告'),
      {
        confirmButtonText: $t('确定'),
        cancelButtonText: $t('取消'),
        type: 'warning'
      }
    )
    // 用户点击确定
    await deleteData()
  } catch {
    // 用户点击取消或关闭
  }
}

// ✅ 提示框
ElMessageBox.alert(
  $t('操作成功'),
  $t('提示'),
  {
    confirmButtonText: $t('确定')
  }
)
```

### ElNotification

```typescript
import { ElNotification } from 'element-plus'

ElNotification({
  title: $t('成功'),
  message: $t('数据已保存'),
  type: 'success',
  duration: 3000,
  position: 'top-right'
})
```

---

## 🔄 Loading 加载

### v-loading 指令（推荐）

```vue
<script setup lang="ts">
const loading = ref(false)

const fetchData = async () => {
  try {
    loading.value = true
    const res = await api.$getData()
    // 处理数据...
  } catch (err) {
    console.error(err)
  } finally {
    // ✅ 必须在 finally 中重置
    loading.value = false
  }
}
</script>

<template>
  <!-- ✅ 局部 loading -->
  <div v-loading="loading">
    <el-table :data="tableData" />
  </div>
</template>
```

### 服务方式（全屏）

```typescript
import { ElLoading } from 'element-plus'

const showFullScreenLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: $t('加载中...'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  // 完成后关闭
  setTimeout(() => {
    loading.close()
  }, 2000)
}
```

---

## 🎛️ 其他常用组件

### Switch 开关

```vue
<template>
  <el-switch
    v-model="enabled"
    :active-text="$t('启用')"
    :inactive-text="$t('禁用')"
    @change="handleChange"
  />
</template>
```

### Tag 标签

```vue
<template>
  <!-- ✅ 动态类型 -->
  <el-tag :type="getTagType(status)">
    {{ statusMap[status] }}
  </el-tag>
</template>

<script setup lang="ts">
const statusMap = {
  0: $t('待审核'),
  1: $t('已通过'),
  2: $t('已拒绝')
}

const getTagType = (status: number) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger' }
  return types[status] || 'info'
}
</script>
```

### Input Number

```vue
<template>
  <el-input-number
    v-model="count"
    :min="0"
    :max="100"
    :step="1"
    controls-position="right"
  />
</template>
```

---

## ❌ 禁止模式

### 硬编码文本（严重错误）

```vue
<!-- ❌ 绝对禁止 -->
<el-button>保存</el-button>
<el-table-column label="名称" />
<el-input placeholder="请输入用户名" />
<el-form-item label="邮箱">

<!-- ✅ 正确 -->
<el-button>{{ $t('保存') }}</el-button>
<el-table-column :label="$t('名称')" />
<el-input :placeholder="$t('请输入用户名')" />
<el-form-item :label="$t('邮箱')">
```

### 验证规则未国际化

```typescript
// ❌ 错误
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
}

// ✅ 正确
const rules = {
  name: [
    { required: true, message: $t('请输入姓名'), trigger: 'blur' }
  ]
}
```

### 缺少 Loading 状态

```typescript
// ❌ 错误：没有 loading 状态
const fetchData = async () => {
  const res = await api.$getData()
  tableData.value = res.data
}

// ✅ 正确：完整的 loading 处理
const fetchData = async () => {
  try {
    loading.value = true
    const res = await api.$getData()
    if (res.success) {
      tableData.value = res.data
    }
  } catch (err) {
    console.error(err)
    ElMessage.error($t('获取数据失败'))
  } finally {
    loading.value = false  // 必须在 finally 中
  }
}
```

### 删除操作无确认

```typescript
// ❌ 错误：直接删除
const handleDelete = async (id: number) => {
  await api.$delete({ id })
}

// ✅ 正确：先确认再删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      $t('确认删除吗？'),
      $t('警告'),
      { type: 'warning' }
    )
    await api.$delete({ id: row.id })
    ElMessage.success($t('删除成功'))
  } catch (error) {
    // 用户取消
  }
}
```

---

## ✅ 最佳实践总结

### 1. 国际化清单

- [ ] 所有按钮文本使用 `$t()`
- [ ] 所有表格列标题使用 `:label="$t('xxx')"`
- [ ] 所有输入框占位符使用 `:placeholder="$t('xxx')"`
- [ ] 所有表单验证消息使用 `$t()`
- [ ] ElMessage/ElMessageBox 文本使用 `$t()`
- [ ] 对话框标题使用 `:title="$t('xxx')"`

### 2. 状态管理清单

- [ ] 异步操作有 loading 状态
- [ ] Loading 在 finally 中重置
- [ ] 表格编辑有备份数据机制
- [ ] 取消编辑能恢复原始数据

### 3. 用户体验清单

- [ ] 删除操作有确认对话框
- [ ] 操作成功/失败有明确提示
- [ ] 表单验证有清晰的错误信息
- [ ] 长列表有分页功能
- [ ] 异步操作有加载提示

### 4. 性能优化清单

- [ ] 使用按需导入
- [ ] 表格数据有分页
- [ ] 级联选择器使用懒加载
- [ ] 避免在模板中频繁调用方法

---

**参考文档**:
- [Element Plus 官方文档](https://element-plus.org/)
- [Element Plus TypeScript 支持](https://element-plus.org/zh-CN/guide/typescript.html)
- [Element Plus 国际化](https://element-plus.org/zh-CN/guide/i18n.html)
