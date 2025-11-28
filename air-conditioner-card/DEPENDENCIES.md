# 依赖项说明

## 必需依赖（Home Assistant 内置）

以下依赖项已经包含在 Home Assistant 中，**无需额外安装**：

### 1. Lit Element
- **用途**: Web Components 框架
- **状态**: ✅ Home Assistant 内置
- **说明**: Home Assistant 2021.3+ 已内置 Lit 框架

### 2. Material Web Components (MWC)
- **用途**: 按钮组件 (`mwc-button`)
- **状态**: ✅ Home Assistant 内置
- **说明**: Home Assistant 已包含 Material Web Components

### 3. Home Assistant 核心组件
- **用途**: 基础 UI 组件
- **包含组件**:
  - `ha-card` - 卡片容器
  - `ha-icon` - 图标组件
  - `ha-switch` - 开关组件
- **状态**: ✅ Home Assistant 内置

## 可选依赖

### 1. Mini Graph Card
- **用途**: 显示温湿度图表（24小时历史数据）
- **状态**: ⚠️ 需要单独安装
- **安装方式**: 通过 HACS 安装
- **是否必需**: ❌ 可选（如果不需要图表功能）

**安装步骤**:
1. 打开 HACS
2. 进入 "Frontend" 分类
3. 搜索 "Mini Graph Card"
4. 点击 "Install"

**注意**: 如果未安装 mini-graph-card，图表部分会显示占位符文本，但卡片的其他功能仍然正常。

## 依赖总结

| 依赖项 | 状态 | 是否必需 | 说明 |
|--------|------|----------|------|
| Lit Element | ✅ 内置 | ✅ 必需 | Home Assistant 自带 |
| Material Web Components | ✅ 内置 | ✅ 必需 | Home Assistant 自带 |
| ha-card/ha-icon/ha-switch | ✅ 内置 | ✅ 必需 | Home Assistant 自带 |
| Mini Graph Card | ⚠️ 需安装 | ❌ 可选 | 仅图表功能需要 |

## 最小安装要求

**好消息**: 除了图表功能外，这个卡片**不需要任何额外依赖**！

只需要：
1. ✅ Home Assistant 2021.3 或更高版本
2. ✅ 将 `air-conditioner-card.js` 添加到资源中

## 功能可用性

### 不安装 Mini Graph Card 时
- ✅ 开关控制
- ✅ 模式切换（制热/制冷/除湿/送风）
- ✅ 温度调节
- ✅ 风速控制
- ✅ 静音/定时功能
- ❌ 温湿度图表（显示占位符）

### 安装 Mini Graph Card 后
- ✅ 所有功能（包括图表）

## 检查依赖

### 检查 Home Assistant 版本
```yaml
# 在 Home Assistant 中查看
设置 > 系统 > 关于
```

需要 **2021.3** 或更高版本。

### 检查 Mini Graph Card 是否安装
1. 打开 HACS
2. 进入 "Frontend" 分类
3. 查看是否已安装 "Mini Graph Card"

或在浏览器控制台检查：
```javascript
// 按 F12 打开控制台，输入：
customElements.get('mini-graph-card')
// 如果返回 undefined，说明未安装
```

## 常见问题

### Q: 卡片显示但按钮无响应？
**A**: 检查浏览器控制台是否有错误，通常是实体ID配置错误。

### Q: 图表不显示？
**A**: 
1. 确认已安装 Mini Graph Card
2. 检查 `temp_entity` 和 `humi_entity` 配置是否正确
3. 设置 `show_graph: false` 可以隐藏图表

### Q: 样式异常？
**A**: 清除浏览器缓存（Ctrl+F5），确保资源已正确加载。

## 推荐配置

为了获得完整功能体验，建议安装：

1. ✅ **Mini Graph Card** (通过 HACS)
   - 用于显示温湿度历史图表

这样你就可以使用卡片的所有功能了！

