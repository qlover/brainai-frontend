# Create Brain App

`create-brain-app` 是一个命令行工具，用于快速创建基于 React 和 AI 的应用程序。它提供了一套完整的项目模板，帮助开发者快速启动项目。

## 功能特性

- **快速启动**：通过简单的命令行操作即可生成完整的项目结构。
- **灵活的模板选择**：支持多种项目模板，满足不同的开发需求。
- **非交互式模式**：支持通过命令行参数进行非交互式项目创建。

## 安装

您可以选择使用 `npx` 直接运行，或者全局安装 `create-brain-app`。

### 使用 npx

```bash
npx create-brain-app
```

### 全局安装

```bash
npm install -g create-brain-app
```

然后使用以下命令创建项目：

```bash
create-brain-app
```

这将会在当前目录下创建一个名为 `<project-name>` 的新文件夹，并在其中生成项目模板。

## 使用说明

### 创建新项目

1. **交互式创建**：运行 `create-brain-app`，根据提示输入项目名称和选择模板。
2. **非交互式创建**：使用命令行参数指定项目名称和模板。(暂不支持)

### 查看帮助

您也可以通过命令行参数以非交互方式创建新项目。请参阅 create-brain-app --help:

```bash
Usage: create-brain-app [options]

Options:
  -v, --version      Output the current version of create-brain-app.
  -h, --help         display help for command
```
