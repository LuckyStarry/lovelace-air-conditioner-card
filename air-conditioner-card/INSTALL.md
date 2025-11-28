# 安装指南

## 前置要求

- Home Assistant 2023.1.0 或更高版本
- HACS（可选，但推荐）

## 安装步骤

### 步骤 1: 下载文件

将以下文件复制到你的 Home Assistant 配置目录：

```
www/
└── air-conditioner-card/
    └── air-conditioner-card.js
```

**注意：** `www` 目录如果不存在，需要手动创建。

### 步骤 2: 添加资源

#### 方法 A: 通过 UI 添加

1. 打开 Home Assistant
2. 进入 **设置** > **仪表盘** > **资源**
3. 点击右下角的 **+ 添加资源**
4. 选择 **JavaScript 模块**
5. 输入 URL: `/local/air-conditioner-card/air-conditioner-card.js`
6. 点击 **创建**

#### 方法 B: 通过 YAML 配置

在 `configuration.yaml` 中添加：

```yaml
lovelace:
  resources:
    - url: /local/air-conditioner-card/air-conditioner-card.js
      type: module
```

然后重启 Home Assistant。

### 步骤 3: 使用卡片

在 Lovelace 配置中添加卡片：

```yaml
type: custom:air-conditioner-card
entity: climate.your_ac_entity
name: 空调名称
temp_entity: sensor.temperature_entity
humi_entity: sensor.humidity_entity
```

## 验证安装

1. 刷新浏览器页面（Ctrl+F5 或 Cmd+Shift+R）
2. 检查浏览器控制台（F12）是否有错误
3. 如果看到卡片正常显示，说明安装成功

## 常见问题

### 卡片显示 "实体未找到"

- 检查 `entity` 配置是否正确
- 确认实体 ID 格式为 `climate.xxx`

### 资源加载失败

- 确认文件路径正确
- 检查文件权限
- 清除浏览器缓存后重试

### 按钮点击无响应

- 检查实体是否支持对应的服务
- 查看浏览器控制台的错误信息
