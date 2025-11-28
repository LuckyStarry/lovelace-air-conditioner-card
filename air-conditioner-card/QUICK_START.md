# 快速开始指南

## 5 分钟快速安装

### 步骤 1: 复制文件

将 `air-conditioner-card.js` 复制到 Home Assistant 的 `www` 目录：

```bash
# 在 Home Assistant 配置目录下
mkdir -p www/air-conditioner-card
cp air-conditioner-card.js www/air-conditioner-card/
```

### 步骤 2: 添加资源

1. 打开 Home Assistant
2. 进入 **设置** > **仪表盘** > **资源**
3. 点击 **+ 添加资源**
4. 选择 **JavaScript 模块**
5. URL 输入: `/local/air-conditioner-card/air-conditioner-card.js`
6. 点击 **创建**

### 步骤 3: 使用卡片

在 Lovelace 配置中添加：

```yaml
type: custom:air-conditioner-card
entity: climate.your_ac_entity
name: 我的空调
temp_entity: sensor.temperature_entity
humi_entity: sensor.humidity_entity
```

### 步骤 4: 刷新页面

按 `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新页面。

## 完成！

现在你应该能看到空调控制卡片了。

## 需要帮助？

查看 [README.md](README.md) 获取详细文档，或查看 [INSTALL.md](INSTALL.md) 获取完整安装指南。

