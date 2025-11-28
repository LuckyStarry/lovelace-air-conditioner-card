# 开发指南

## 项目结构

```
air-conditioner-card/
├── air-conditioner-card.js    # 主卡片文件
├── README.md                   # 使用说明
├── INSTALL.md                 # 安装指南
├── manifest.json              # HACS 清单文件
├── hacs.json                  # HACS 配置
└── example-usage.yaml         # 使用示例
```

## 技术栈

- **Lit Element**: Web Components 框架
- **TypeScript/JavaScript**: 开发语言
- **Home Assistant Lovelace API**: 卡片接口

## 开发环境设置

### 1. 本地开发

1. 在 Home Assistant 的 `www` 目录下创建卡片目录
2. 将 `air-conditioner-card.js` 复制到该目录
3. 添加资源并刷新页面

### 2. 调试

- 打开浏览器开发者工具（F12）
- 查看 Console 标签页的错误信息
- 使用 Network 标签页检查资源加载

## 代码结构说明

### 主要类: `AirConditionerCard`

继承自 `LitElement`，实现 Home Assistant 卡片接口。

#### 关键方法

- `setConfig(config)`: 设置卡片配置
- `getCardSize()`: 返回卡片大小（用于布局）
- `render()`: 渲染卡片 HTML
- `_updateEntities()`: 更新实体状态
- `_handle*()`: 事件处理方法

### 样式系统

使用 Lit 的 `static get styles()` 定义 CSS，支持：

- CSS 变量
- 响应式设计
- 主题适配

## 扩展功能

### 添加新的模式

1. 在 `render()` 方法的模式选择部分添加新按钮
2. 在 `_getModeColor()` 和 `_getModeGradient()` 中添加颜色定义
3. 在 `_getModeIcon()` 中添加图标

### 添加新的控制功能

1. 在 `render()` 中添加新的 UI 元素
2. 创建对应的事件处理方法（如 `_handleNewFeature()`）
3. 调用 `_callService()` 执行操作

### 自定义样式

可以通过 `card-mod` 或直接修改 CSS：

```javascript
static get styles() {
  return css`
    .air-conditioner-card {
      /* 你的自定义样式 */
    }
  `;
}
```

## 测试

### 功能测试清单

- [ ] 卡片正常显示
- [ ] 开关功能正常
- [ ] 模式切换正常
- [ ] 温度调节正常
- [ ] 风速控制正常
- [ ] 图表显示正常（如果启用）
- [ ] 静音/定时功能正常（如果实体存在）

### 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari

## 发布到 HACS

1. 创建 GitHub 仓库
2. 上传所有文件
3. 在 HACS 中添加自定义仓库
4. 其他用户可以通过 HACS 安装

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License
