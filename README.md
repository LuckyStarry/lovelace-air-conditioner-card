# 空调控制自定义卡片

这是一个类似 Mushroom 的自定义卡片组件，用于控制空调设备。

## 功能特性

- ✅ 模式切换（制热、制冷、除湿、送风）
- ✅ 温度调节（+/- 按钮）
- ✅ 风速控制（自动、静音、1-5 档）
- ✅ 静音和定时功能
- ✅ 温湿度图表（24 小时，可选）
- ✅ 根据模式自动变色
- ✅ 响应式布局

## 安装方法

### 方法一：通过 HACS 安装（推荐）

1. 在 HACS 中，进入 "Frontend" 分类
2. 点击右上角的三个点菜单
3. 选择 "Custom repositories"
4. 添加此仓库：
   - Repository: `LuckyStarry/lovelace-air-conditioner-card`
   - Category: `Frontend`
5. 点击 "Install" 安装
6. 在 Home Assistant 配置中添加资源

### 方法二：手动安装

1. 下载 `air-conditioner-card.js` 文件
2. 将文件复制到 Home Assistant 的 `www/air-conditioner-card/` 目录
3. 在 Home Assistant 配置中添加资源

## 配置资源

在 Home Assistant 的配置中添加资源：

**通过 UI 配置：**

1. 进入 "设置" > "仪表盘" > "资源"
2. 点击 "添加资源"
3. 选择 "JavaScript 模块"
4. 输入 URL: `/hacsfiles/lovelace-air-conditioner-card/air-conditioner-card.js`（HACS 安装）
   或 `/local/air-conditioner-card/air-conditioner-card.js`（手动安装）
5. 点击 "创建"

**通过 YAML 配置：**
在 `configuration.yaml` 中添加：

```yaml
lovelace:
  resources:
    - url: /hacsfiles/lovelace-air-conditioner-card/air-conditioner-card.js
      type: module
```

## 使用方法

### 基本用法

```yaml
type: custom:air-conditioner-card
entity: climate.master_bedroom_ac
name: 主卧空调
temp_entity: sensor.master_bedroom_temperature
humi_entity: sensor.master_bedroom_humidity
```

### 完整配置

```yaml
type: custom:air-conditioner-card
entity: climate.master_bedroom_ac
name: 主卧空调
temp_entity: sensor.master_bedroom_temperature
humi_entity: sensor.master_bedroom_humidity
show_graph: true
```

### 在网格布局中使用

```yaml
- type: grid
  cards:
    - type: custom:air-conditioner-card
      entity: climate.master_bedroom_ac
      name: 主卧空调
      temp_entity: sensor.master_bedroom_temperature
      humi_entity: sensor.master_bedroom_humidity
      grid_options:
        columns: 6
        rows: auto
    - type: custom:air-conditioner-card
      entity: climate.living_room_ac
      name: 客厅空调
      temp_entity: sensor.living_room_temperature
      humi_entity: sensor.living_room_humidity
      grid_options:
        columns: 6
        rows: auto
```

## 配置选项

| 参数          | 类型    | 必需 | 默认值 | 说明                          |
| ------------- | ------- | ---- | ------ | ----------------------------- |
| `entity`      | string  | ✅   | -      | 空调的 climate 实体 ID        |
| `name`        | string  | ❌   | "空调" | 卡片显示的名称                |
| `temp_entity` | string  | ❌   | -      | 温度传感器实体 ID（用于图表） |
| `humi_entity` | string  | ❌   | -      | 湿度传感器实体 ID（用于图表） |
| `show_graph`  | boolean | ❌   | true   | 是否显示温湿度图表            |

## 依赖项

### 必需依赖（Home Assistant 内置，无需安装）

- ✅ `lit` - Web Components 框架（Home Assistant 2021.3+ 已内置）
- ✅ `mwc-button` - Material Web Components（Home Assistant 已内置）
- ✅ `ha-card`, `ha-icon`, `ha-switch` - Home Assistant 核心组件

### 可选依赖

- ⚠️ `mini-graph-card` - 图表显示（可选，仅图表功能需要）
  - 通过 HACS 安装
  - 如果未安装，图表部分会显示占位符，其他功能正常

**重要**: 除了图表功能外，此卡片**不需要任何额外依赖**！

## 开发说明

### 文件结构

```
lovelace-air-conditioner-card/
├── air-conditioner-card.js    # 主卡片文件
├── README.md                   # 使用说明
├── hacs.json                   # HACS 配置
└── LICENSE                     # 许可证
```

### 自定义样式

卡片使用 CSS 变量，可以通过 `card-mod` 自定义样式：

```yaml
type: custom:air-conditioner-card
entity: climate.ac
card_mod:
  style: |
    .air-conditioner-card {
      border-radius: 16px;
    }
```

### 扩展功能

如果需要添加新功能，可以修改 `air-conditioner-card.js` 文件：

1. 在 `render()` 方法中添加新的 UI 元素
2. 添加对应的事件处理方法
3. 在 `static get styles()` 中添加样式

## 故障排除

1. **卡片不显示**

   - 检查资源是否正确添加
   - 检查浏览器控制台是否有错误
   - 确认实体 ID 是否正确

2. **按钮无响应**

   - 检查实体是否支持对应的服务
   - 检查浏览器控制台是否有错误

3. **图表不显示**

   - 确认已安装 `mini-graph-card`
   - 检查温度和湿度传感器实体 ID 是否正确
   - 设置 `show_graph: false` 可以隐藏图表

4. **样式异常**
   - 清除浏览器缓存
   - 检查是否有其他卡片样式冲突

## 许可证

MIT License

Copyright (c) 2025 SUN BO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
