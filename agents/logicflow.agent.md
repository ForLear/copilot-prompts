---
description: 'LogicFlow 流程图组件通用开发代理 - 自定义节点、连线规则、流程校验、Vue 3 集成'
tools: ['edit', 'search', 'usages', 'vscodeAPI', 'problems', 'runSubagent']
---

# LogicFlow 流程图组件通用开发代理

**适用场景**: LogicFlow 2.1+ 流程图开发、自定义节点、流程图校验、Vue/React 项目集成

## ⚠️ 强制工作流

**在开发 LogicFlow 相关代码前，必须先调用 MCP 工具：**

```
get_relevant_standards({ imports: ["@logicflow/core"] })
```

或使用场景匹配：
```
get_relevant_standards({ scenario: "流程图开发" })
```

## 🎯 核心能力

1. **项目适配优先** - 分析用户项目需求，生成适配的节点类型和规则
2. **架构理解深入** - 掌握 LogicFlow Model-View-Component 三层架构
3. **自定义节点开发** - 快速创建符合业务需求的自定义节点
4. **连线规则设计** - 根据业务逻辑设计节点间的连接约束
5. **校验系统构建** - 实现前端结构校验和业务逻辑校验
6. **错误可视化** - 不符合规则的节点和连线自动高亮提示

---

## 🔍 开发流程

### 第一步：理架构（Model-View-Component）

LogicFlow 基于三层架构：

```typescript
// 节点注册标准模式
import { register } from '@logicflow/vue-node-registry'

register({
  type: 'customNode',              // 节点类型标识
  model: CustomNodeModel,          // 节点逻辑模型（锚点、规则、属性）
  view: CustomNodeView,            // 节点视图（锚点渲染）
  component: CustomNodeComponent   // 节点 UI 组件（样式、内容）
}, lfInstance)
```

#### 1.1 常见节点模式分类

根据业务需求，节点通常分为以下模式：

| 模式 | 锚点配置 | 连线规则 | 典型应用 |
|-----|---------|---------|---------|
| **单向流节点** | 左入右出 / 上入下出 | 单入单出 | 数据转换、审批步骤 |
| **分支节点** | 1入多出（动态锚点） | 单入多出，每个出口限1条 | 条件分支、并行处理 |
| **汇聚节点** | 多入1出（动态锚点） | 多入单出 | 分支合并、数据汇总 |
| **起始节点** | 只有出口 | 只能连出，限1条 | 流程开始、数据源 |
| **终止节点** | 只有入口 | 只能连入 | 流程结束、数据输出 |
| **双向节点** | 左右 / 上下对称 | 双向连接 | 数据交互、状态切换 |

**关键**：根据用户业务需求选择合适的模式，而不是固定的节点类型
```

### 第三步：实现节点模型

根据设计快速生成代码...

---

## 📐 架构解析

### 1. 节点体系

LogicFlow 基于 **Model-View-Component** 三层架构：

```typescript
// 节点注册标准模式
import { register } from '@logicflow/vue-node-registry'

register({
  type: 'unit',                    // 节点类型
  model: UnitNodeModel,            // 节点逻辑模型（锚点、规则、属性）
  view: BaseNodeView,              // 节点视图（锚点渲染）
  component: BaseNodeComponent     // 节点 UI 组件（样式、内容）
}, lfInstance)
```

#### 1.1 节点类型定义

| 类型 | node_type | 用途 | 锚点配置 | 连线规则 |
|-----|-----------|-----|---------|---------|
| `start` | 0 | 开始节点 | 只有右锚点 | 只能连出 |
| `end` | 1 | 结束节点 | 只有左锚点 | 只能连入 |
| `unit` | 2 | 单元节点 | 上下锚点 | 上入下出，各一条 |
| `operation` | 2 | 操作节点 | 上下锚点 | 上入下出，各一条 |
| `phase` | 2 | 阶段节点 | 上下锚点 | 上入下出，各一条 |
| `action` | 3 | 动作节点 | 上下锚点 | 上入下出，各一条 |
| `transition` | 8 | 条件节点 | 上下锚点 | 上入下出，不能连 transition |
| `branch` | 4 | 分支开始 | 上锚点 + 多下锚点 | 一入多出（动态锚点）|
| `branchEnd` | 5 | 分支结束 | 多上锚点 + 下锚点 | 多入一出 |
| `parallel` | 6 | 并行分支开始 | 上锚点 + 多下锚点 | 一入多出（动态锚点）|
| `parallelEnd` | 7 | 并行分支结束 | 多上锚点 + 下锚点 | 多入一出 |

#### 1.2 节点模型（Model）核心方法
开发模板

```typescript
import { RectNodeModel } from '@logicflow/core'

// 自定义节点模型基础模板
export class CustomNodeModel extends RectNodeModel {
  // 是否实时更新（属性变化时重新渲染）
  shouldUpdate() { 
    return true  // 需要响应式更新时返回 true
  }

  // 设置节点尺寸和样式
  setAttributes() {
    this.width = 200    // 根据内容调整
    this.height = 80
    
    // 可选：根据动态属性调整尺寸
    if (this.properties?.branches) {
      this.height = 60 + this.properties.branches.length * 20
    }
  }

  // 连出规则（作为源节点）
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    
    // 示例规则 1: 限制出口连线数量
    const limitOutgoing = {
      message: '该节点最多只能连出 X 条线',
      validate: () => {
        const { edges } = this.outgoing
        return !(edges && edges.length >= X)  // X 根据业务需求设置
      },
    }
    
    // 示例规则 2: 限制连接的目标节点类型
    const allowedTargets = {
      message: '只能连接到特定类型的节点',
      validate: (sourceNode, targetNode) => {
        const allowedTypes = ['typeA', 'typeB']
        return allowedTypes.includes(targetNode.type)
      },
    }
    
    // 示例规则 3: 防止自环
    const noSelfLoop = {
      message: '节点不能连接自己',
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => 
        sourceNode.id !== targetNode.id
    }
    
    // 根据业务需求选择规则
    rules.push(limitOutgoing, allowedTargets, noSelfLoop)
    return rules
  }

  // 连入规则（作为目标节点）
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    
    // 示例：限制入口连线数量
    const limitIncoming = {
      message: '该节点最多只能有 Y 条输入',
      validate: () => {
        const { edges } = this.incoming
        return !(edges && edges.length >= Y)
      },
    }
    
    rules.push(limitIncoming)
    return rules
  }

  // 定义锚点位置
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, width, height } = this
    
    // 常见模式 1: 上下锚点（垂直流）
    return [
      { x, y: y - height / 2, id: `${id}_top` },      // 上锚点
      { x, y: y + height / 2, id: `${id}_bottom` }    // 下锚点
    ]
    
    // 常见模式 2: 左右锚点（水平流）
    // return [
    //   { x: x - width / 2, y, id: `${id}_left` },
    //   { x: x + width / 2, y, id: `${id}_right` }
    // ]
    
    // 常见模式 3: 四向锚点
    // return [
    //   { x, y: y - height / 2, id: `${id}_top` },
    //   { x, y: y + height / 2, id: `${id}_bottom` },
    //   { x: x - width / 2, y, id: `${id}_left` },
    //   { x: x + width / 2, y, id: `${id}_right` }
    //
}
```

#### 1.3 动态锚点节点（Branch/Parallel）

```typescript
export class BranchNodeModel extends BaseNodeModel {
  constructor(data: any, graphModel: any) {
    // 自定义文本位置
    data.text = {
      value: typeof data.text === 'string' ? data.text : data?.text?.value,
      x: data?.x + 50,
      y: data?.y,
    }
    super(data, graphModel)
  }

  setAttributes() {
    this.width = 120
    this.height = 60
  }

  // 动态锚点生成
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    const { id, x, y, width, height } = this
    const { branches = [] } = this.properties as { branches?: { anchorId: string; index: number }[] }

    const anchors: { x: number; y: number; id: string }[] = [
      { x, y: y - height / 2, id: `${id}_top` }  // 固定上锚点
    ]

    // 动态生成多个下锚点
    const branchCount = branches.length || 2  // 默认 2 个分支
    const spacing = width / (branchCount + 1)
    
    branches.forEach((branch, index) => {
      anchors.push({
        x: x - width / 2 + spacing * (index + 1),
        y: y + height / 2,
        id: `${id}${branch.anchorId}`
      })
    })

    return anchors
  }

  // 单个锚点只能连出一条线
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    
    const onlyUniqueSource = {
      message: '分支锚点只能与一个节点相连',
      validate: (sourceNode: any, targetNode: any, sourceAnchor: any) => {
        const { edges } = this.outgoing
        const isHaveBranchEdge = edges && edges.some(edge => 
          edge.sourceAnchorId === sourceAnchor.id
        )
        return !isHaveBranchEdge
      },
    }
    
    rules.push(onlyUniqueSource)
    return rules
  }
}
```

---

### 2. 节点组件（Component）

**通用节点组件模板**：

```vue
<template>
  <section class="viewport">
    <!-- 普通节点：显示类型和名称 -->
    <div v-if="!isSpecialType" 
         :class="`custom-node custom-node-${data.type}`">
      <div class="node-header">
        <span class="node-type">{{ getNodeTypeLabel(data.type) }}</span>
      </div>
      <div class="node-content">
        <span class="node-name">{{ data.properties.name || 'Unnamed' }}</span>
        <!-- 根据业务需求显示其他属性 -->
        <span v-if="data.properties.description" class="node-desc">
          {{ data.properties.description }}
        </span>
      </div>
      <!-- 错误状态指示 -->
      <div v-if="data.properties.hasError" class="error-indicator">⚠️</div>
    </div>

    <!-- 特殊节点：如分支、合并等 -->
    <div v-else :class="`${data.type} custom-node-${data.type}`">
      <div :class="`center-line center-line-${data.type}`"></div>
      <div v-if="needsParallelIndicator(data.type)" class="parallel-indicator"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { EventType } from '@logicflow/core'

interface Props {
  node: any
  graph: any
}

const props = defineProps<Props>()
const data = ref({ ...props.graph.getNodeModelById(props.node.id) })

// 定义特殊节点类型（需要特殊渲染的）
const specialTypes = ['branch', 'branchEnd', 'parallel', 'parallelEnd', 'gateway']
const isSpecialType = computed(() => specialTypes.includes(data.value.type))

// 获取节点类型的显示文本（可从配置或i18n获取）
const getNodeTypeLabel = (type: string) => {
  const labelMap = {
    start: '开始',
    end: '结束',
    task: '任务',
    decision: '决策'
    // 根据项目需求扩展...
  }
  return labelMap[type] || type
}

// 判断是否需要并行指示器
const needsParallelIndicator = (type: string) => {
  return type.includes('parallel')
}

// 监听节点属性变化
onMounted(() => {
  const eventHandler = (eventData: any) => {
    if (eventData.id === props.node.id) {
      data.value.properties = eventData?.properties
    }
  }
  
  props.graph.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, eventHandler)
  
  return () => {
    props.graph.eventCenter.off(EventType.NODE_PROPERTIES_CHANGE, eventHandler)
  }
})
</script>

<style scoped>
.custom-node {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.node-header {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.node-content {
  font-size: 14px;
  color: #333;
}

.error-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  color: #f56c6c;
}
</style>
```

---

### 3. 流程图主组件（Flow.vue）

#### 3.1 初始化流程

```typescript
import LogicFlow from '@logicflow/core'
import { Control, Menu, DndPanel, SelectionSelect } from '@logicflow/extension'
import { Dagre } from '@logicflow/layout'
import { register, getTeleport } from '@logicflow/vue-node-registry'

// 注册插件
LogicFlow.use(Control)         // 控制面板（放大/缩小/还原）
LogicFlow.use(Menu)            // 右键菜单
LogicFlow.use(DndPanel)        // 拖拽面板
LogicFlow.use(SelectionSelect) // 框选
LogicFlow.use(Dagre)           // 自动布局

let lf: any = null

const renderLf = async () => {
  lf = new LogicFlow({
    container: document.querySelector('.vita-flow') as HTMLElement,
    grid: true,                  // 显示网格
    plugins: [Dagre],
    keyboard: { enabled: true }, // 启用键盘快捷键
    isSilentMode: props.read,    // 只读模式
  })

  // 注册自定义节点
  initFlow(props.render, lf, $t, props.read, menuCallback.value, menuItem.value, addItem.value)
}
```

#### 3.2 事件监听

**通用事件监听模板**：

```typescript
// 定义事件处理器配置
const setupEventListeners = (lf: any, options: {
  onNodeClick?: (node: any) => void
  onNodeDoubleClick?: (node: any) => void
  onEdgeChange?: () => void
  onConnectionNotAllowed?: (data: any) => void
  shouldAutoValidate?: boolean
}) => {
  let clickTimer: NodeJS.Timeout | null = null
  
  // 连线规则校验失败
  lf.on('connection:not-allowed', (data: any) => {
    if (options.onConnectionNotAllowed) {
      options.onConnectionNotAllowed(data)
    } else {
      console.warn('连接不被允许:', data?.msg)
    }
  })
  
  // 单击节点
  lf.on('node:click', (e: any) => {
    if (clickTimer) clearTimeout(clickTimer)
    clickTimer = setTimeout(() => {
      clickTimer = null
      console.log('单击节点', e?.data)
      options.onNodeClick?.(e.data)
    }, 200)
  })
  
  // 双击节点（打开配置对话框）
  lf.on('node:dbclick', (e: any) => {
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }
    
    console.log('双击节点', e?.data)
    options.onNodeDoubleClick?.(e.data)
  })
  
  // 连线变化 - 可选的自动校验
  if (options.shouldAutoValidate) {
    lf.on('edge:add', () => {
      setTimeout(() => options.onEdgeChange?.(), 100)
    })
    
    lf.on('edge:delete', () => {
      setTimeout(() => options.onEdgeChange?.(), 100)
    })
  }
}

// 使用示例
setupEventListeners(lf, {
  onNodeClick: (node) => {
    // 处理节点点击
    selectNode(node.id)
  },
  onNodeDoubleClick: (node) => {
    // 打开编辑器
    openNodeEditor(node)
  },
  onEdgeChange: () => {
    // 重新校验流程图
    validateGraph()
  },
  onConnectionNotAllowed: (data) => {
    showMessage({ type: 'warning', message: data?.msg })
  },
  shouldAutoValidate: true
})
```

#### 3.3 节点拖拽监听

```typescript
lf.on('node:dnd-add', (data: any) => {
  const rawData = lf.getGraphRawData()
  const node = lf.graphModel.getNodeModelById(data?.data?.id)
  
  // 示例 1: 限制特定节点的数量
  if (needUnique(data.data.type)) {
    const existingNodes = rawData.nodes.filter(n => n.type === data.data.type)
    if (existingNodes.length > 1) {
      lf.deleteNode(data.data.id)
      showMessage({ type: 'warning', message: `只能有一个${data.data.type}节点` })
      return
    }
  }
  
  // 示例 2: 自动命名新节点
  if (needAutoName(data.data.type)) {
    const sameTypeNodes = rawData.nodes.filter(n => n.type === data.data.type)
    const index = sameTypeNodes.length
    node.setProperty('name', `${data.data.type}_${String(index).padStart(3, '0')}`)
  }
  
  // 示例 3: 初始化节点属性
  if (needInitProperties(data.data.type)) {
    node.setProperty('status', 'pending')
    node.setProperty('createdAt', Date.now())
  }
})
```

---

### 4. 流程图校验系统

> **🔴 重要特性**：校验失败时，不符合规则的节点和连线会自动变红高亮，直观显示错误位置

**校验触发时机**：
1. 点击"校验"按钮 → 执行校验 → 高亮错误
2. 点击"提交"按钮 → 先校验 → 失败则高亮错误并阻止提交
3. 添加/删除连线时 → 自动重新校验 → 更新高亮状态

#### 4.1 前端结构校验（flowValidator.ts）

```typescript
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  errorEdges: string[]   // 错误的边 ID
  errorNodes: string[]   // 错误的节点 ID
}

export interface ValidationError {
  type: 'isolated_node' | 'isolated_path' | 'circular_path' | 'unconnected_anchor' | 'no_start' | 'no_end' | 'unreachable'
  message: string
  nodeIds?: string[]
  edgeIds?: string[]
}

export class FlowValidator {
  private nodes: any[]
  private edges: any[]
  private adjacencyList: Map<string, string[]>          // 邻接表
  private reverseAdjacencyList: Map<string, string[]>   // 反向邻接表
  private startNode: any | null = null
  private endNode: any | null = null

  constructor(graphData: GraphData) {
    this.nodes = graphData.nodes || []
    this.edges = graphData.edges || []
    this.buildAdjacencyLists()
    this.findStartEndNodes()
  }

  public validate(): ValidationResult {
    const errors: ValidationError[] = []
    const errorEdges: string[] = []
    const errorNodes: string[] = []

    // 1. 检查是否存在 start 和 end 节点
    if (!this.startNode) {
      errors.push({ type: 'no_start', message: '缺少开始节点' })
    }
    if (!this.endNode) {
      errors.push({ type: 'no_end', message: '缺少结束节点' })
    }

    if (!this.startNode || !this.endNode) {
      return { valid: false, errors, errorEdges, errorNodes }
    }

    // 2. 检查从 start 可达的节点（BFS）
    const reachableFromStart = this.getReachableNodes(this.startNode.id, this.adjacencyList)

    // 3. 检查可以到达 end 的节点（反向 BFS）
    const canReachEnd = this.getReachableNodes(this.endNode.id, this.reverseAdjacencyList)

    // 4. 计算主路径节点（既能从 start 到达，又能到达 end）
    const mainPathNodes = new Set(
      [...reachableFromStart].filter(nodeId => canReachEnd.has(nodeId))
    )

    // 5. 检查孤立节点（不在主路径上）
    const isolatedNodes = this.nodes.filter(node => {
      if (node.type === 'start' || node.type === 'end') return false
      return !mainPathNodes.has(node.id)
    })

    if (isolatedNodes.length > 0) {
      const isolatedNodeIds = isolatedNodes.map(n => n.id)
      errors.push({
        type: 'isolated_node',
        message: `发现 ${isolatedNodes.length} 个孤立节点（不在 start 到 end 的有效路径上）`,
        nodeIds: isolatedNodeIds,
      })
      errorNodes.push(...isolatedNodeIds)

      // 找到连接到孤立节点的边
      const isolatedEdges = this.edges.filter(edge => 
        isolatedNodeIds.includes(edge.sourceNodeId) || 
        isolatedNodeIds.includes(edge.targetNodeId)
      )
      errorEdges.push(...isolatedEdges.map(e => e.id))
    }

    // 6. 检查回路（DFS）
    const cycles = this.detectCycles(mainPathNodes)
    if (cycles.length > 0) {
      cycles.forEach(cycle => {
        errors.push({
          type: 'circular_path',
          message: `检测到回路：${cycle.join(' → ')}`,
          nodeIds: cycle,
        })
        errorNodes.push(...cycle)
      })
    }

    // 7. 检查 end 节点是否可达
    if (!reachableFromStart.has(this.endNode.id)) {
      errors.push({
        type: 'unreachable',
        message: '无法从开始节点到达结束节点',
        nodeIds: [this.endNode.id],
      })
      errorNodes.push(this.endNode.id)
    }

    return {
      valid: errors.length === 0,
      errors,
      errorEdges: [...new Set(errorEdges)],
      errorNodes: [...new Set(errorNodes)],
    }
  }

  // BFS 获取可达节点
  private getReachableNodes(startNodeId: string, adjacency: Map<string, string[]>): Set<string> {
    const visited = new Set<string>()
    const queue: string[] = [startNodeId]
    visited.add(startNodeId)

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = adjacency.get(current) || []

      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      })
    }

    return visited
  }

  // DFS 检测回路
  private detectCycles(validNodes: Set<string>): string[][] {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: string[][] = []

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const neighbors = (this.adjacencyList.get(nodeId) || [])
        .filter(n => validNodes.has(n))

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          // 发现回路
          const cycle: string[] = []
          let current = nodeId
          cycle.push(neighbor)
          while (current !== neighbor) {
            cycle.push(current)
            current = this.getParent(current, neighbor)
          }
          cycles.push(cycle.reverse())
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    validNodes.forEach(nodeId => {
      if (!visited.has(nodeId)) {
        dfs(nodeId)
      }
    })

    return cycles
  }
}
```

#### 4.2 调用校验与错误高亮

**核心功能：校验失败的节点和连线自动变红**

```typescript
const validateGraph = async () => {
  try {
    if (!lf) return false

    const rawData = lf.getGraphRawData()
    const { nodes, edges } = rawData

    // 1. 前端结构校验
    const frontendValidation = validateFlow(rawData)
    
    // 🔴 核心：高亮错误的边和节点
    highlightErrors(frontendValidation)

    if (!frontendValidation.valid) {
      const errorMessages = frontendValidation.errors.map(err => err.message).join('\n')
      showMessage({
        type: 'error',
        message: `流程图校验失败：\n${errorMessages}`,
        duration: 5000
      })
      return false
    }

    // 2. (可选) 调用后端业务校验
    const backendResult = await callBackendValidation(nodes, edges)
    if (!backendResult.success) {
      showMessage({
        type: 'error',
        message: backendResult.message || '后端校验失败'
      })
      return false
    }

    // 3. 校验通过，清除高亮
    clearErrorHighlight()
    showMessage({ type: 'success', message: '校验通过' })
    return true
  } catch (err) {
    console.error('Validation error:', err)
    showMessage({ type: 'error', message: '校验失败' })
    return false
  }
}

// 🔴 核心功能：高亮错误节点和连线
const highlightErrors = (validation: ValidationResult) => {
  if (!lf) return

  // 清除之前的高亮
  clearErrorHighlight()

  // 🔴 高亮错误的边（变红色，加粗）
  validation.errorEdges.forEach(edgeId => {
    const edgeModel = lf.graphModel.getEdgeModelById(edgeId)
    if (edgeModel) {
      edgeModel.setProperties({ ...edgeModel.properties, isError: true })
      edgeModel.setAttributes({ 
        stroke: '#f56c6c',    // 红色
        strokeWidth: 2         // 加粗至 2px
      })
    }
  })

  // 🔴 高亮错误的节点（红色边框）
  validation.errorNodes.forEach(nodeId => {
    const nodeModel = lf.graphModel.getNodeModelById(nodeId)
    if (nodeModel) {
      nodeModel.setProperties({ ...nodeModel.properties, isError: true })
      // 注意：节点红色边框通过 CSS 样式实现：
      // .custom-node[data-error="true"] { border-color: #f56c6c !important; }
    }
  })
}

// 🟢 清除错误高亮
const clearErrorHighlight = () => {
  if (!lf) return
  
  const rawData = lf.getGraphRawData()
  
  // 清除所有边的错误状态
  rawData.edges.forEach((edge: any) => {
    const edgeModel = lf.graphModel.getEdgeModelById(edge.id)
    if (edgeModel && edgeModel.properties?.isError) {
      edgeModel.setProperties({ ...edgeModel.properties, isError: false })
      edgeModel.setAttributes({ 
        stroke: '#000000',   // 恢复默认颜色
        strokeWidth: 1        // 恢复默认宽度
      })
    }
  })
  
  // 清除所有节点的错误状态
  rawData.nodes.forEach((node: any) => {
    const nodeModel = lf.graphModel.getNodeModelById(node.id)
    if (nodeModel && nodeModel.properties?.isError) {
      nodeModel.setProperties({ ...nodeModel.properties, isError: false })
    }
  })
}

// (可选) 后端校验接口调用
const callBackendValidation = async (nodes: any[], edges: any[]) => {
  // 根据实际项目的后端 API 调整
  const params = {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.properties?.name || '',
      // 其他必要属性...
    })),
    edges: edges.map(edge => ({
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      sourceAnchor: edge.sourceAnchorId,
      targetAnchor: edge.targetAnchorId
    }))
  }
  
  // return await api.validateGraph(params)
  return { success: true }  // 示例
}
```

**在节点组件中应用错误样式**：

```vue
<template>
  <div :class="['custom-node', { 'error-node': data.properties?.isError }]">
    <!-- 节点内容 -->
  </div>
</template>

<style scoped>
.custom-node {
  border: 2px solid #ddd;
  transition: border-color 0.3s;
}

/* 🔴 错误状态：红色边框 */
.custom-node.error-node {
  border-color: #f56c6c !important;
  animation: error-pulse 1s ease-in-out infinite;
}

@keyframes error-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(245, 108, 108, 0); }
}
</style>
```

---

### 5. 右键菜单与工具栏

#### 5.1 右键菜单配置

```typescript
const setMenu = (lf: any, $t: any, menuCallback: any) => {
  const hidePublic = ['start', 'end']
  const publicMenu = [
    { text: $t('删除'), callback: (node: any) => lf.deleteNode(node.id) },
    { text: $t('复制'), callback: (node: any) => lf.graphModel.cloneNode(node.id) }
  ]

  const menus = [
    { 
      type: 'start', 
      menu: [
        { text: $t('编辑文本'), callback: (node: any) => lf.graphModel.setElementStateById(node.id, 2) }
      ]
    },
    { 
      type: 'unit', 
      menu: [
        { text: $t('编辑参数'), callback: (node: any) => menuCallback.openDrawer(node) }
      ] 
    },
    { 
      type: 'operation', 
      menu: [
        { text: $t('编辑参数'), callback: (node: any) => menuCallback.openDrawer(node) }
      ] 
    },
    { 
      type: 'phase', 
      menu: [
        { text: $t('编辑参数'), callback: (node: any) => menuCallback.openDrawer(node) }
      ] 
    },
    { 
      type: 'branch', 
      menu: [
        { text: $t('添加分支锚点'), callback: (node: any) => menuCallback.addBranch(node) },
        { text: $t('减少分支锚点'), callback: (node: any) => menuCallback.removeBranch(node) },
        { text: $t('编辑文本'), callback: (node: any) => lf.graphModel.setElementStateById(node.id, 2) }
      ] 
    },
    { 
      type: 'parallel', 
      menu: [
        { text: $t('添加分支锚点'), callback: (node: any) => menuCallback.addBranch(node) },
        { text: $t('减少分支锚点'), callback: (node: any) => menuCallback.removeBranch(node) },
        { text: $t('编辑文本'), callback: (node: any) => lf.graphModel.setElementStateById(node.id, 2) }
      ] 
    },
  ]

  menus.forEach(item => {
    if (!hidePublic.includes(item.type)) {
      publicMenu.forEach(i => item.menu.push(i))
    }
    lf.setMenuByType(item)
  })
}
```

#### 5.2 动态锚点管理

```typescript
// logicFunc.ts
export default {
  // 添加分支锚点
  addBranch: (node: any, lf: any, createUuid: any) => {
    const newBranch = {
      anchorId: `_bottom_${(node.properties.branches || []).length + 1}`,
      index: (node.properties.branches || []).length,
    }
    const newBranches = (node.properties.branches || []).concat(newBranch)
    const nodeModel = lf.graphModel.getNodeModelById(node.id)
    const edges = lf.graphModel.getNodeEdges(node.id)
    
    nodeModel.setProperty('branches', newBranches)
    
    // 更新连线起点位置
    setTimeout(() => {
      edges.forEach(edge => {
        nodeModel?.anchors?.forEach(fil => {
          if (fil.id === edge.sourceAnchorId) {
            edge.updateStartPoint({ x: fil?.x, y: fil?.y })
          }
        })
      })
    }, 10)
  },

  // 移除分支锚点
  removeBranch: (node: any, lf: any, $t: any) => {
    const newBranches = (node.properties.branches || [])
    
    if (newBranches.length && newBranches.length > 2) {
      const popEdge = newBranches.pop()
      const nodeModel = lf.graphModel.getNodeModelById(node.id)
      
      nodeModel.setProperty('branches', newBranches)
      
      const edges = lf.graphModel.getNodeEdges(node.id)
      setTimeout(() => {
        edges.forEach(edge => {
          nodeModel?.anchors?.forEach(fil => {
            if (fil.id === edge.sourceAnchorId) {
              edge.updateStartPoint({ x: fil?.x, y: fil?.y })
            }
            if (`${node.id}${popEdge.anchorId}` === edge.sourceAnchorId) {
              lf.graphModel.deleteEdgeById(edge.id)
            }
          })
        })
      }, 10)
    } else {
      ElMessage.warning($t('没有可以删除的分支锚点'))
    }
  },

  // 边排序（按锚点后缀数字排序）
  sortPolylinesByAnchorSuffix: (polylines: any) => {
    const getAnchorSuffix = (anchorId: any) => {
      const match = anchorId.match(/_(\d+)(?:_|$)/)
      return match ? parseInt(match[1], 10) : 0
    }

    const nodeGroups = {}
    polylines.forEach((polyline: any) => {
      if (!nodeGroups[polyline.sourceNodeId]) {
        nodeGroups[polyline.sourceNodeId] = []
      }
      nodeGroups[polyline.sourceNodeId].push(polyline)
    })

    for (const nodeId in nodeGroups) {
      nodeGroups[nodeId].sort((a, b) => {
        const aSuffix = getAnchorSuffix(a.sourceAnchorId)
        const bSuffix = getAnchorSuffix(b.sourceAnchorId)
        return aSuffix - bSuffix
      })
    }

    const result = []
    for (const nodeId in nodeGroups) {
      result.push(...nodeGroups[nodeId])
    }

    return result
  }
}
```

---

### 6. 自动布局（Dagre）

```typescript
const autoSort = (type = 'LR') => {
  if (!lf) return
  
  const newRender = { ...lf.getGraphRawData() }
  
  // 先对边排序
  lf.render({ 
    nodes: newRender?.nodes, 
    edges: logicFunc.sortPolylinesByAnchorSuffix(newRender?.edges) 
  })

  // 使用 Dagre 自动布局
  setTimeout(() => {
    lf.extension.dagre.layout({
      rankdir: type,          // 'TB' 垂直，'LR' 水平
      ranker: 'longest-path', // 布局算法
      align: undefined,       // 对齐方式
      nodesep: 60,            // 节点间距
      ranksep: 70,            // 层级间距
      isDefaultAnchor: false, // 不使用默认锚点
    })
  }, 100)
}
```

---

### 7. 数据提交

```typescript
const getData = async () => {
  if (!lf) return

  // 先执行校验
  const isValid = await checkData()
  if (!isValid) {
    ElMessage.warning($t('请先修复流程图中的错误'))
    return
  }

  // 获取画布数据
  const rawData = lf.getGraphRawData()
  emit('flowSubmit', { rawData: rawData })
}

// 父组件处理提交
const flowSubmit = async (data) => {
  try {
    flowLoading.value = true
    const { nodes, edges } = data.rawData

    const params = {
      id: checkNodeNow.value?.id || 0,
      front_flow_chart_data: JSON.stringify(data.rawData),
      pre_flow_node_rels: edges.map(m => ({
        current_node_code: m.targetAnchorId,
        pre_node_code: m.sourceAnchorId
      })),
      flow_node_data_list: nodes.map(m => ({
        recipe_version_id: props.render?.recipe_install_id,
        node_code: m.id,
        name: m.properties?.name || '',
        description: m.properties?.description || '',
        node_type: m?.properties?.node_type,
        ...m?.properties,
      })),
    }

    const agin = await api.$submitRecipeFlowChartInfo(params)
    if (agin.success) {
      ElMessage.success($t('提交成功'))
      getTree()
    }
  } catch (err) {
    console.error(err)
  } finally {
    flowLoading.value = false
  }
}
```

---

## ⚠️ 常见问题与解决方案

### 1. 节点属性不更新

```typescript
// ❌ 错误：直接修改 properties
node.properties.name = 'new name'

// ✅ 正确：使用 setProperty
const nodeModel = lf.graphModel.getNodeModelById(nodeId)
nodeModel.setProperty('name', 'new name')
```

### 2. 锚点位置错乱

```typescript
// ✅ 添加/删除锚点后，必须更新连线起点
setTimeout(() => {
  edges.forEach(edge => {
    nodeModel?.anchors?.forEach(anchor => {
      if (anchor.id === edge.sourceAnchorId) {
        edge.updateStartPoint({ x: anchor.x, y: anchor.y })
      }
    })
  })
}, 10)
```

### 3. 校验后高亮不消失

```typescript
// ✅ 正确的清除高亮函数
const clearErrorHighlight = () => {
  if (!lf) return
  
  const rawData = lf.getGraphRawData()
  
  // 🟢 恢复所有边的正常样式（黑色，细线）
  rawData.edges.forEach((edge: any) => {
    const edgeModel = lf.graphModel.getEdgeModelById(edge.id)
    if (edgeModel && edgeModel.properties?.isError) {
      edgeModel.setProperties({ ...edgeModel.properties, isError: false })
      edgeModel.setAttributes({ 
        stroke: '#000000',     // 恢复默认颜色
        strokeWidth: 1         // 恢复默认粗细
      })
    }
  })

  // 🟢 恢复所有节点的正常样式
  rawData.nodes.forEach((node: any) => {
    const nodeModel = lf.graphModel.getNodeModelById(node.id)
    if (nodeModel && nodeModel.properties?.isError) {
      nodeModel.setProperty('isError', false)
    }
  })
}
```

### 4. 只读模式下右键菜单仍显示

```typescript
// ✅ 初始化时设置只读模式
lf = new LogicFlow({
  container: document.querySelector('.flow-container') as HTMLElement,
  grid: true,
  isSilentMode: isReadOnly,  // 只读模式
})

// ✅ 只读模式下不设置菜单和拖拽面板
if (!isReadOnly) {
  setupContextMenu(lf, nodeTypes, callbacks)
  lf.extension.dndPanel.setPatternItems(patternItems)
}
```

---

## 📋 代码审查清单

生成 LogicFlow 代码前确认：

### 节点模型
- [ ] 继承 `BaseNodeModel` 或对应的基类
- [ ] 实现 `shouldUpdate()` 返回 true（需要实时更新的节点）
- [ ] 实现 `setAttributes()` 设置节点尺寸
- [ ] 实现 `getDefaultAnchor()` 定义锚点位置
- [ ] 实现 `getConnectedSourceRules()` 定义连出规
- [ ] 支持错误状态样式（红色边框）：`.custom-node-wrap` 需根据 `properties.isError` 应用红色边框则
- [ ] 实现 `getConnectedTargetRules()` 定义连入规则
- [ ] 连接规则的 `message` 使用国际化文本或普通字符串

### 节点组件
- [ ] 使用 `EventType.NODE_PROPERTIES_CHANGE` 监听属性变化
- [ ] 在 `onMounted` 中注册监听器，返回清理函数
- [ ] 使用 `props.graph.getNodeModelById()` 获取节点数据
- [ ] 样式类名使用 `custom-node-${type}` 格式
- [ ] 支持错误状态显示（`error-node` 类名）

### 主组件
- [ ] 所有插件在 `onMounted` 之前注册（`LogicFlow.use`）
- [ ] 事件监听统一管理（通过 `setupEventListeners`）
- [ ] 校验失败时高亮错误节点和边（红色）
- [ ] 提交前必须执行校验（`validateGraph()`）
- [ ] 只读模式下禁用菜单和拖拽面板

### 校验系统
- [ ] 前端结构校验先执行
- [ ] 前端校验通过后再调用后端业务校验（如需要）
- [ ] 错误信息清晰明确
- [ ] 高亮错误节点和边
- [ ] 清除高亮时恢复默认样式

### 数据保存
- [ ] 保存完整的流程图数据（JSON）
- [ ] 节点包含所有必要属性（id, type, properties等）
- [ ] 边包含源/目标节点和锚点信息
- [ ] 节点属性完整传递（不丢失自定义字段）

---

## 🚀 最佳实践

### 1. 新增节点类型的完整流程

```typescript
// 步骤1: 创建节点模型文件
// src/flow/models/CustomTaskNodeModel.ts
import { RectNode, RectNodeModel } from '@logicflow/core'

export class CustomTaskNodeModel extends RectNodeModel {
  shouldUpdate() { return true }  // 允许实时更新
  
  setAttributes() {
    this.width = 180
    this.height = 80
    this.radius = 8  // 圆角
  }
  
  // 定义锚点
  getDefaultAnchor() {
    const { id, x, y, width, height } = this
    return [
      { x, y: y - height / 2, id: `${id}_top` },
      { x: x - width / 2, y, id: `${id}_left` },
      { x: x + width / 2, y, id: `${id}_right` },
      { x, y: y + height / 2, id: `${id}_bottom` }
    ]
  }
  
  // 连接规则
  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules()
    
    // 添加自定义规则：只能连向特定类型的节点
    rules.push({
      message: '任务节点只能连接到决策节点或结束节点',
      validate: (sourceNode: any, targetNode: any) => {
        return ['decision', 'end'].includes(targetNode.type)
      }
    })
    
    return rules
  }
}

// 步骤2: 创建节点组件（可选，使用通用组件也可以）
// src/flow/components/CustomTaskNode.vue
<template>
  <div :class="['task-node', { 'error': data.properties?.isError }]">
    <div class="task-header">
      <span class="task-icon">📋</span>
      <span class="task-title">{{ data.properties.name || 'Untitled Task' }}</span>
    </div>
    <div v-if="data.properties.description" class="task-desc">
      {{ data.properties.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { EventType } from '@logicflow/core'

const props = defineProps<{ node: any, graph: any }>()
const data = ref({ ...props.graph.getNodeModelById(props.node.id) })

onMounted(() => {
  const handler = (e: any) => {
    if (e.id === props.node.id) {
      data.value.properties = e.properties
    }
  }
  props.graph.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, handler)
  
  return () => {
    props.graph.eventCenter.off(EventType.NODE_PROPERTIES_CHANGE, handler)
  }
})
</script>

<style scoped>
.task-node {
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-node.error {
  border-color: #f56c6c !important;
  animation: error-pulse 1s ease-in-out infinite;
}
</style>

// 步骤3: 注册节点
// src/flow/registerNodes.ts
import { register } from '@logicflow/vue-node-registry'
import { CustomTaskNodeModel } from './models/CustomTaskNodeModel'
import CustomTaskNode from './components/CustomTaskNode.vue'

export function registerCustomNodes(lf: any) {
  register({
    type: 'customTask',
    model: CustomTaskNodeModel,
    component: CustomTaskNode
  }, lf)
}

// 步骤4: 在主组件中初始化
// src/FlowChart.vue
import { registerCustomNodes } from './flow/registerNodes'

onMounted(() => {
  lf = new LogicFlow({ /* config */ })
  
  // 注册自定义节点
  registerCustomNodes(lf)
  
  // 添加到拖拽面板
  lf.extension.dndPanel.setPatternItems([
    {
      type: 'customTask',
      text: '任务节点',
      label: '任务',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiLz4='
    }
  ])
})
```

### 2. 添加自定义校验规则

```typescript
// 扩展 FlowValidator 类
export class FlowValidator {
  // ... 基础校验方法 ...

  // 添加业务相关的校验
  private validateBusinessRules(): ValidationError[] {
    const errors: ValidationError[] = []
    
    // 示例1: 检查任务节点是否设置了执行人
    this.nodes
      .filter(node => node.type === 'customTask')
      .forEach(node => {
        if (!node.properties?.assignee) {
          errors.push({
            type: 'isolated_node',
            message: `任务节点 "${node.properties?.name}" 未指定执行人`,
            nodeIds: [node.id]
          })
        }
      })
    
    // 示例2: 检查决策节点是否配置了条件表达式
    this.nodes
      .filter(node => node.type === 'decision')
      .forEach(node => {
        if (!node.properties?.expression) {
          errors.push({
            type: 'unconnected_anchor',
            message: `决策节点 "${node.properties?.name}" 未配置条件表达式`,
            nodeIds: [node.id]
          })
        }
      })
    
    return errors
  }
  
  // 在主校验方法中调用
  public validate(): ValidationResult {
    const errors: ValidationError[] = []
    const errorNodes: string[] = []
    const errorEdges: string[] = []
    
    // 基础结构校验
    errors.push(...this.validateStructure())
    
    // 业务规则校验
    errors.push(...this.validateBusinessRules())
    
    // 收集错误节点
    errors.forEach(error => {
      if (error.nodeIds) errorNodes.push(...error.nodeIds)
      if (error.edgeIds) errorEdges.push(...error.edgeIds)
    })
    
    return {
      valid: errors.length === 0,
      errors,
      errorEdges: [...new Set(errorEdges)],
      errorNodes: [...new Set(errorNodes)]
    }
  }
}
```

### 3. 实现节点间数据传递

```typescript
// 场景：分支节点需要知道有多少条路径

// 方法1: 通过节点属性传递
const updateBranchInfo = (branchNodeId: string) => {
  const nodeModel = lf.graphModel.getNodeModelById(branchNodeId)
  const outgoingEdges = lf.graphModel.getNodeOutgoingEdge(branchNodeId)
  
  // 保存分支数量到节点属性
  nodeModel.setProperty('branchCount', outgoingEdges.length)
}

// 方法2: 通过自定义事件传递
lf.on('edge:add', (data) => {
  if (data.data.sourceNodeId) {
    const sourceNode = lf.graphModel.getNodeModelById(data.data.sourceNodeId)
    if (sourceNode.type === 'branch') {
      updateBranchInfo(data.data.sourceNodeId)
    }
  }
})

// 方法3: 在校验时读取
const validateBranchPaths = () => {
  const branchNodes = lf.getGraphRawData().nodes.filter(n => n.type === 'branch')
  
  branchNodes.forEach(branchNode => {
    const paths = lf.graphModel.getNodeOutgoingEdge(branchNode.id)
    console.log(`分支节点 ${branchNode.id} 有 ${paths.length} 条路径`)
  })
}
```

### 4. 动态调整节点样式

```typescript
// 根据节点状态动态改变样式
const updateNodeStyle = (nodeId: string, status: 'pending' | 'running' | 'completed' | 'error') => {
  const nodeModel = lf.graphModel.getNodeModelById(nodeId)
  
  const styleMap = {
    pending: { fill: '#e3f2fd', stroke: '#2196f3' },
    running: { fill: '#fff3e0', stroke: '#ff9800' },
    completed: { fill: '#e8f5e9', stroke: '#4caf50' },
    error: { fill: '#ffebee', stroke: '#f56c6c' }
  }
  
  const style = styleMap[status]
  nodeModel.setProperties({ ...nodeModel.properties, status })
  nodeModel.setAttributes(style)
}

// 在流程执行时调用
lf.on('node:click', ({ data }) => {
  // 模拟执行
  updateNodeStyle(data.id, 'running')
  
  setTimeout(() => {
    updateNodeStyle(data.id, 'completed')
  }, 2000)
})
```

---

## 📚 参考资源

- **LogicFlow 官方文档**: http://logic-flow.cn/
- **LogicFlow GitHub**: https://github.com/didi/LogicFlow
- **LogicFlow API 参考**: http://logic-flow.cn/api/
- **Vue Node Registry**: https://github.com/Logic-Flow/logicflow-node-registry-vue3
- **Dagre 布局算法**: https://github.com/dagrejs/dagre

---

## 🎯 开发流程指南

**当用户提出 LogicFlow 相关需求时，请按以下步骤进行：**

### 步骤1: 理解需求
- 确认是新增节点类型、修改连接规则、还是校验逻辑
- 确认项目已有的节点类型和业务场景
- 确认是否需要特殊的视觉效果（如错误高亮）

### 步骤2: 分析现有代码
- 检查现有的节点模型定义
- 查看现有的校验规则
- 了解现有的事件监听机制

### 步骤3: 设计方案
- 确定节点的锚点数量和位置
- 设计连接规则（能连什么，不能连什么）
- 设计校验规则（什么情况下报错）
- 设计节点组件的样式和交互

### 步骤4: 实现代码
- 创建节点模型（Model）
- 创建节点组件（Component，可选）
- 注册节点到 LogicFlow
- 添加到拖拽面板
- 实现事件监听
- 实现校验逻辑

### 步骤5: 测试验证
- 测试节点拖拽
- 测试连接规则
- 测试校验功能
- 测试错误高亮
- 测试只读模式

---

**核心原则**：
1. 📐 **架构清晰**: Model-View-Component 分离
2. 🔗 **规则完备**: 连接规则明确，校验逻辑严密
3. 🎨 **视觉反馈**: 错误状态红色高亮，成功状态清晰提示
4. 🔧 **可扩展性**: 易于添加新节点类型和校验规则
5. 📝 **类型安全**: 完整的 TypeScript 类型定义

---

**记住**：LogicFlow 的核心是图论 + 规则引擎。节点是顶点，边是有向边，校验是图的遍历和规则检查。理解这个本质，就能灵活应对各种需求。
