# 微信小程序开发 Agent

> 专注于微信小程序开发的 Copilot Agent  
> 遵循官方规范和最佳实践

## 🎯 适用场景

- 微信小程序项目开发
- 小程序组件开发
- 小程序性能优化
- 小程序架构设计

---

## ⚠️ 强制工作流

**在编写任何小程序代码前，必须先调用 MCP 工具加载规范！**

### 开发页面时

```
get_relevant_standards({ 
  fileType: "js",
  imports: ["wx"],
  scenario: "小程序页面开发"
})
```

### 开发组件时

```
get_relevant_standards({ 
  fileType: "js",
  imports: ["wx", "Component"],
  scenario: "小程序组件开发"
})
```

### 网络请求相关

```
get_relevant_standards({ 
  scenario: "小程序网络请求"
})
```

### 本地存储相关

```
get_relevant_standards({ 
  scenario: "小程序本地存储"
})
```

### 云开发相关 🆕

```
get_relevant_standards({ 
  scenario: "小程序云开发"
})

# 或具体场景
get_relevant_standards({ 
  scenario: "云函数开发"
})

get_relevant_standards({ 
  scenario: "云数据库操作"
})

get_relevant_standards({ 
  scenario: "云存储管理"
})
```

---

## 🏗️ 项目架构

### 目录结构

```
miniprogram/
├── app.js                    # 小程序逻辑
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── pages/                    # 页面目录
├── components/               # 组件目录
├── utils/                    # 工具函数
├── api/                      # API 管理
├── config/                   # 配置文件
└── styles/                   # 公共样式
```

---

## 📝 代码生成规则

### 1. 页面开发

#### Page 结构模板

```javascript
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    list: [],
    page: 1,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取路由参数
    const { id } = options
    // 初始化数据
    this.fetchData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时的逻辑
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      page: 1,
      list: []
    })
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    })
    this.fetchData()
  },

  /**
   * 获取数据
   */
  async fetchData() {
    try {
      this.setData({ loading: true })
      
      const res = await api.getData({
        page: this.data.page
      })
      
      this.setData({
        list: this.data.page === 1 
          ? res.data.list 
          : [...this.data.list, ...res.data.list],
        hasMore: res.data.hasMore
      })
    } catch (error) {
      console.error('获取数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})
```

### 2. 组件开发

#### Component 结构模板

```javascript
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: null,
      observer(newVal, oldVal) {
        if (newVal) {
          this._processData(newVal)
        }
      }
    },
    
    size: {
      type: String,
      value: 'medium'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    processedData: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理数据（私有方法）
     */
    _processData(data) {
      this.setData({
        processedData: {
          ...data,
          // 处理逻辑
        }
      })
    },

    /**
     * 处理点击事件
     */
    handleClick(e) {
      const { id } = e.currentTarget.dataset
      
      // 触发自定义事件
      this.triggerEvent('itemclick', {
        id
      })
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件挂载时执行
    },

    detached() {
      // 组件移除时执行
    }
  }
})
```

### 3. WXML 模板规范

```xml
<!-- ✅ 标准模板结构 -->
<view class="container">
  <!-- 加载状态 -->
  <view wx:if="{{loading}}" class="loading">
    <text>加载中...</text>
  </view>

  <!-- 内容 -->
  <block wx:else>
    <!-- 列表 - 必须添加 wx:key -->
    <view 
      wx:for="{{list}}" 
      wx:key="id"
      class="item"
      data-id="{{item.id}}"
      bindtap="handleItemClick"
    >
      <text>{{item.title}}</text>
    </view>

    <!-- 空状态 -->
    <view wx:if="{{list.length === 0}}" class="empty">
      <text>暂无数据</text>
    </view>
  </block>
</view>
```

### 4. WXSS 样式规范

```css
/* ✅ 使用 CSS 变量 */
page {
  --primary-color: #1aad19;
  --text-color: #333;
  --border-color: #e5e5e5;
}

/* ✅ BEM 命名 */
.user-card {
  padding: 30rpx;
  background: #fff;
}

.user-card__avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.user-card__name {
  font-size: 32rpx;
  color: var(--text-color);
}

/* ✅ Flex 布局 */
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
```

---

## 🌐 网络请求规范

### Request 封装

必须包含以下功能：

1. **统一的错误处理**
2. **Token 自动添加**
3. **Loading 状态管理**
4. **401 自动跳转登录**
5. **请求/响应拦截**

```javascript
// utils/request.js
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    needAuth = true,
    showLoading = true
  } = options

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true })
  }

  return new Promise((resolve, reject) => {
    const header = {
      'content-type': 'application/json'
    }

    // 添加 Token
    if (needAuth) {
      const token = wx.getStorageSync('token')
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success: (res) => {
        if (showLoading) wx.hideLoading()

        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(new Error(res.data.message))
          }
        } else if (res.statusCode === 401) {
          // 跳转登录
          wx.redirectTo({ url: '/pages/login/login' })
          reject(new Error('未授权'))
        } else {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(new Error('Network error'))
        }
      },
      fail: (error) => {
        if (showLoading) wx.hideLoading()
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}
```

---

## 💾 本地存储规范

### 存储封装

```javascript
// utils/storage.js

/**
 * 同步设置存储
 */
function setStorageSync(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (error) {
    console.error('存储失败:', error)
    return false
  }
}

/**
 * 同步获取存储
 */
function getStorageSync(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (error) {
    console.error('读取存储失败:', error)
    return defaultValue
  }
}
```

---

## 🖼️ 资源管理规范 ⚠️

### 关键原则

1. **禁止硬编码本地图片路径** - 避免路径不存在导致错误
2. **优先使用 emoji/文字图标** - 无需加载资源，性能最优
3. **外部图片需要备用方案** - 网络请求可能失败
4. **占位图使用纯色背景** - 避免依赖外部服务

### 图标资源

```xml
<!-- ❌ 错误：硬编码本地路径 -->
<image src="/images/icons/search.png" />
<image src="/images/icons/cart.png" />

<!-- ✅ 正确：使用 emoji 图标 -->
<text class="icon">🔍</text>  <!-- 搜索 -->
<text class="icon">🛒</text>  <!-- 购物车 -->
<text class="icon">✅</text>  <!-- 选中 -->
<text class="icon">⭕</text>  <!-- 未选中 -->

/* CSS 样式 */
.icon {
  font-size: 32rpx;
  line-height: 1;
}
```

### 商品图片

```javascript
// ❌ 错误：直接使用外部图片
<image src="https://via.placeholder.com/400" />

// ✅ 正确：带备用方案
<image 
  src="{{product.image || 'https://dummyimage.com/400x400/f5f5f5/cccccc?text=Product'}}" 
  mode="aspectFill"
  lazy-load
/>

// ✅ 更好：使用纯色背景 + 文字
.product-image {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}
```

### 横幅/Banner

```xml
<!-- ❌ 错误：依赖外部图片资源 -->
<swiper>
  <swiper-item wx:for="{{banners}}">
    <image src="{{item.image}}" />  <!-- 可能加载失败 -->
  </swiper-item>
</swiper>

<!-- ✅ 正确：使用纯色渐变背景 -->
<view class="banner">
  <text class="banner-title">🛒 美业商城</text>
  <text class="banner-desc">精选美业服务</text>
</view>

/* CSS */
.banner {
  background: linear-gradient(135deg, #ff6034 0%, #ee0a24 100%);
  /* 无需加载图片，性能最优 */
}
```

---

## ☁️ 云开发规范 🆕

### 1. 环境初始化

```javascript
// app.js
App({
  onLaunch() {
    // ✅ 正确：先检查再初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }

    try {
      wx.cloud.init({
        env: 'your-env-id',  // 从配置文件读取
        traceUser: true
      })
      console.log('云开发初始化成功')
    } catch (error) {
      console.error('云开发初始化失败:', error)
    }
  }
})
```

### 2. 数据库错误处理 ⚠️

```javascript
// ✅ 正确：检测数据库集合是否存在
async fetchData() {
  try {
    const db = wx.cloud.database()
    const res = await db.collection('products').get()
    this.setData({ data: res.data })
  } catch (error) {
    console.error('查询失败:', error)
    
    // ⚠️ 关键：检测集合不存在错误
    if (error.errCode === -502005 || 
        error.message?.includes('collection not exists')) {
      wx.showModal({
        title: '数据库未初始化',
        content: '请先在云开发控制台创建数据库集合',
        confirmText: '查看教程',
        success: (res) => {
          if (res.confirm) {
            // 跳转到配置引导页
            wx.navigateTo({ url: '/pages/setup/setup' })
          }
        }
      })
    } else {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
    
    // ⚠️ 关键：清空旧数据，避免显示错误内容
    if (this.data.page === 1) {
      this.setData({ data: [] })
    }
  }
}
```

### 3. 云数据库封装

```javascript
// utils/cloudDB.js
class CloudDB {
  constructor(collectionName) {
    this.db = wx.cloud.database()
    this.collection = this.db.collection(collectionName)
  }

  /**
   * 查询列表（带错误处理）
   */
  async getList(options = {}) {
    try {
      const { page = 1, pageSize = 20, where = {} } = options
      
      // 分页查询
      const res = await this.collection
        .where(where)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      
      return {
        data: res.data,
        hasMore: res.data.length === pageSize
      }
    } catch (error) {
      console.error('查询列表失败:', error)
      throw error  // 向上抛出，由调用者处理
    }
  }
}

module.exports = { CloudDB }
```

### 4. 云函数开发

```javascript
// cloudfunctions/xxx/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const db = cloud.database()
    
    // ✅ 关键：服务端验证数据
    const { productId, price } = event
    
    // 验证价格（防止客户端篡改）
    const product = await db.collection('products')
      .doc(productId)
      .get()
    
    if (product.data.price !== price) {
      return {
        success: false,
        message: '价格不匹配'
      }
    }
    
    // 创建订单
    const result = await db.collection('orders').add({
      data: {
        _openid: OPENID,
        productId,
        price,
        createTime: new Date()
      }
    })
    
    return {
      success: true,
      orderId: result._id
    }
  } catch (error) {
    console.error('云函数执行失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

## 🎯 性能优化原则

### 1. setData 优化

```javascript
// ❌ 错误：频繁调用
for (let i = 0; i < items.length; i++) {
  this.setData({
    [`items[${i}]`]: items[i]
  })
}

// ✅ 正确：合并更新
this.setData({
  items: items
})

// ✅ 正确：局部更新
this.setData({
  [`items[${index}].name`]: newName
})
```

### 2. 列表渲染优化

```xml
<!-- ✅ 图片懒加载 -->
<image src="{{item.image}}" lazy-load mode="aspectFill" />

<!-- ✅ 长列表分页 -->
<scroll-view 
  scroll-y 
  bindscrolltolower="onReachBottom"
  lower-threshold="100"
>
  <view wx:for="{{list}}" wx:key="id">
    {{item.name}}
  </view>
</scroll-view>
```

### 3. 代码分包

```json
{
  "subpackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/detail/detail"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}
```

---

## 🔐 安全规范

### 1. 敏感信息处理

```javascript
// ❌ 禁止：明文存储密码
wx.setStorageSync('password', '123456')

// ✅ 正确：加密存储
const encrypted = encrypt(password, key)
wx.setStorageSync('password', encrypted)
```

### 2. XSS 防护

```javascript
// ✅ 转义用户输入
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
```

### 3. 接口鉴权

```javascript
// ✅ Token 机制
// 1. 登录时保存 Token
wx.setStorageSync('token', res.data.token)

// 2. 请求时自动添加
header['Authorization'] = `Bearer ${token}`

// 3. 401 时跳转登录
if (res.statusCode === 401) {
  wx.redirectTo({ url: '/pages/login/login' })
}
```

---

## 📱 用户体验规范

### 1. 加载状态

```javascript
// ✅ 所有异步操作显示 loading
async fetchData() {
  try {
    this.setData({ loading: true })
    const res = await api.getData()
    // 处理数据...
  } catch (error) {
    wx.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    this.setData({ loading: false })
  }
}
```

### 2. 错误提示

```javascript
// ✅ 清晰的错误信息
wx.showToast({
  title: '操作失败，请重试',
  icon: 'none',
  duration: 2000
})

// ✅ 确认对话框
wx.showModal({
  title: '提示',
  content: '确认删除这条记录吗？',
  confirmColor: '#ff4444',
  success: (res) => {
    if (res.confirm) {
      this.handleDelete()
    }
  }
})
```

### 3. 空状态

```xml
<!-- ✅ 无数据时显示空状态 -->
<view wx:if="{{list.length === 0 && !loading}}" class="empty">
  <image src="/images/empty.png" class="empty-image" />
  <text class="empty-text">暂无数据</text>
</view>
```

---

## ❌ 禁止模式

### 代码层面

```javascript
// ❌ 直接修改 data
this.data.count = 10

// ✅ 使用 setData
this.setData({ count: 10 })

// ❌ 没有错误处理
async fetchData() {
  const res = await api.getData()
  this.setData({ data: res.data })
}

// ✅ 完善的错误处理
async fetchData() {
  try {
    const res = await api.getData()
    this.setData({ data: res.data })
  } catch (error) {
    console.error('获取数据失败:', error)
    wx.showToast({ title: '加载失败', icon: 'none' })
  }
}

// ❌ 错误：在 catch 块中引用未定义的变量
async fetchData() {
  try {
    const { page } = this.data  // page 只在 try 块中
    // ...
  } catch (error) {
    if (page === 1) {  // ❌ ReferenceError: page is not defined
      this.setData({ data: [] })
    }
  }
}

// ✅ 正确：使用 this.data 访问
async fetchData() {
  try {
    const { page } = this.data
    // ...
  } catch (error) {
    if (this.data.page === 1) {  // ✅ 正确
      this.setData({ data: [] })
    }
  }
}
```

### 性能陷阱

```javascript
// ❌ setData 过于频繁
for (let i = 0; i < 100; i++) {
  this.setData({ count: i })
}

// ✅ 合并更新
this.setData({ count: 100 })

// ❌ 传递大量无用数据
this.setData({
  hugeObject: entireObject  // 包含很多不需要的字段
})

// ✅ 只传必要数据
this.setData({
  displayData: {
    id: object.id,
    name: object.name
  }
})
```

---

## ✅ 最佳实践总结

### 开发规范

1. **文件组织** - 遵循推荐的目录结构
2. **命名规范** - 使用 kebab-case/camelCase
3. **代码注释** - 为复杂逻辑添加注释
4. **错误处理** - 所有异步操作都有 try-catch
5. **用户反馈** - 操作结果有明确提示

### 资源管理 🆕

1. **禁止硬编码本地图片路径** - 避免 404 错误
2. **优先使用 emoji** - 无需加载，性能最优
3. **纯色背景替代图片** - CSS 渐变替代轮播图
4. **图片加载失败处理** - 提供备用方案

### 云开发规范 🆕

1. **环境初始化检查** - 检测 wx.cloud 是否可用
2. **数据库集合检测** - errCode -502005 特殊处理
3. **友好错误提示** - 引导用户配置数据库
4. **服务端数据验证** - 云函数中验证价格/库存
5. **清空错误数据** - 失败后清空旧数据

### 变量作用域 🆕

1. **异步函数中避免使用局部变量** - 在 catch 中使用 this.data
2. **解构赋值注意作用域** - const { page } 只在当前块有效
3. **避免变量覆盖** - 不要在内层作用域重新声明同名变量

### 性能优化

1. **setData 优化** - 减少调用频率，控制数据大小
2. **列表优化** - 长列表使用分页或虚拟列表
3. **图片优化** - 使用 lazy-load，压缩图片
4. **代码分包** - 合理使用分包和预加载

### 安全规范

1. **敏感信息** - 加密存储，不明文传输
2. **XSS 防护** - 转义用户输入
3. **接口鉴权** - Token 验证，刷新机制
4. **HTTPS** - 所有接口使用 HTTPS

---

## 📚 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [小程序开发指南](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0008aeea9a8978b00086a685851c0a)
- [小程序性能优化](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/)
- [小程序安全指南](https://developers.weixin.qq.com/miniprogram/dev/framework/security.html)

---

**维护团队**: MTA工作室  
**版本**: 1.0.0  
**更新日期**: 2025-12-17
