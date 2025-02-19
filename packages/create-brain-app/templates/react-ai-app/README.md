## 跳过 lint-staged

```bash
git commit -m "你的提交信息" --no-verify
```

## 项目测试

```bash
pnpm test
```

测试覆盖以下：

- .ts 文件
- .tsx 组件文件
- use 自定义 react hooks


由于项目中引入了 @preact/signals 库，导致 jest 在模拟真实react组件测试时配置相当复杂

而真实的组件执行需要 [@preact/signals/react-transform](https://github.com/preactjs/signals/tree/main/packages/react-transform) 的支持，

jest 本身是 commonjs 的测试框架，现代react项目可能依赖大量 esm，所以当前项目使用 vitest 代替了 jest


## 项目文件/目录命名

目录采用小写驼峰，比如：exampleTest

文件采用大写驼峰，比如：ExampleTest.tsx

# React Flow UI 设计工具

一个基于自然语言命令生成和修改流程图的交互式 UI 设计工具。使用 React Flow 构建并集成了 Cerebras AI API。

## 功能特点

- **自然语言 UI 生成**：用普通语言描述您的 UI 设计需求，即可获得交互式流程图
- **实时更新**：通过自然语言描述修改您的设计
- **交互式画布**：拖拽节点、创建连接、可视化修改布局
- **响应式设计**：全屏画布，现代简洁的界面
- **智能节点处理**：带有输入/输出连接点的自定义节点类型

## 环境要求

- Node.js (v14 或更高版本)
- pnpm (v8 或更高版本)

## 项目结构
imagica-reactflow/
├── src/                  # 源代码目录
│   ├── __mocks__/       # 测试模拟
│   ├── __tests__/       # 测试文件
│   ├── assets/          # 静态资源
│   ├── base/            # 基础功能
│   │   ├── api/         # API 接口
│   │   ├── kernel/      # 核心功能
│   │   ├── port/        # 接口定义
│   │   └── store/       # 状态管理
│   ├── config/          # 配置文件
│   │   └── register/    # 依赖注入注册
│   ├── pages/           # 页面组件
│   │   ├── ApiManagementNewPage/  # API 管理页面
│   │   ├── ExperimentPage/     # 实验页面
│   │   └── HomePage/           # 首页
│   ├── uikit/           # UI 组件库
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── providers/   # 上下文提供者
│   │   ├── styles/      # 样式文件
│   │   └── utils/       # 工具函数
│   └── views/           # 视图组件
│       ├── apiManagementNew/      # API 管理相关组件
│       ├── components/         # 公共视图组件
│       ├── ExampleTest/        # 示例测试组件
│       ├── experiment/         # 实验相关组件
│       └── Layout/            # 布局组件
├── public/              # 静态文件
└── server/              # 后端服务

## 安装步骤

1. 克隆仓库：

```bash
git clone <repository-url>
cd imagica-reactflow
```

2. 安装依赖：

```bash
pnpm install
```

## 运行应用

1. 在新终端中启动前端开发服务器：

```bash
cd ..  # 返回项目根目录
pnpm dev
```

2. 在浏览器中打开终端显示的 URL（通常是 http://localhost:5173）

## 使用说明

1. **初始设计**：
   - 在输入框中输入您的 UI 设计需求描述
   - 点击"生成"创建初始流程图
   - 示例："创建一个包含主页、当前天气和天气预报页面的天气应用"

2. **修改设计**：
   - 在现有图表的基础上，在输入框中输入修改请求
   - 点击"更新"应用更改
   - 示例："添加一个与主页相连的设置页面"

3. **交互功能**：
   - 拖拽节点重新定位
   - 使用鼠标滚轮缩放
   - 拖拽背景平移画布
   - 通过拖拽连接点连接节点
   - 使用小地图导航大型图表
   - 使用控制面板进行缩放和视图适配操作

## 技术细节

- 使用 React 和 Vite 构建
- 使用 @xyflow/react 实现流程图功能
- 可配置样式的自定义节点组件
- Express.js 后端用于 AI 集成
- Cerebras AI API 用于自然语言处理

## 故障排除

- 如果服务器无法启动，检查端口 3001 是否可用
- 如果节点不可见，确保画布具有适当的尺寸
- 如果边无法连接，检查节点是否正确配置了连接点
- 如果更新不起作用，验证 Cerebras API 密钥是否有效

## 参与贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m '添加一些很棒的特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目基于 MIT 许可证授权 - 查看 LICENSE 文件了解详情
