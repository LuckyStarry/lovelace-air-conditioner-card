# LuckyStarry Lovelace Cards

这是一个 Home Assistant Lovelace 自定义卡片集合仓库，包含多个可复用的卡片组件。

## 包含的卡片

### Air Conditioner Card

空调控制自定义卡片，提供类似 Mushroom 风格的空调控制界面。

- **目录**: `air-conditioner-card/`
- **功能**: 模式切换、温度调节、风速控制、温湿度图表等
- **文档**: 查看 [air-conditioner-card/README.md](air-conditioner-card/README.md)

## 安装方法

### 通过 HACS 安装

1. 在 HACS 中，进入 "Frontend" 分类
2. 点击右上角的三个点菜单
3. 选择 "Custom repositories"
4. 添加此仓库：
   - Repository: `你的仓库地址`
   - Category: `Frontend`
5. 在 HACS 中搜索并安装你需要的卡片
6. 在 Home Assistant 配置中添加资源

### 手动安装

1. 进入对应的卡片目录（如 `air-conditioner-card/`）
2. 将卡片文件复制到 Home Assistant 的 `www/` 目录
3. 在 Home Assistant 配置中添加资源

## 使用说明

每个卡片都有独立的文档和使用示例，请查看对应卡片目录下的 README.md 文件。

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
