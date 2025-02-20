# brainai frontend

A tools for brainai

一个私有的 monorepo 项目，用于管理 brainai 的前端项目

## 目录结构

```bash
├── .github/ # GitHub 配置文件
│ ├── workflows/ # GitHub Actions 工作流
├── .vscode/ # VSCode 配置文件
├── .husky/ # husky 配置文件
├── packages/
│ ├── create-brain-app/ # 创建应用的工具包
├── .gitignore # Git 忽略文件
├── package.json # 项目配置文件
└── README.md # 项目说明文档
```

## 项目预检查

### Commit Message Lint

使用 [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) 规范提交

Conventional Commits 是一种基于约定的提交规范，建议每个 Git 提交消息遵循一定的格式。基本格式

如下：

```bash
<type>(<scope>): <message>
```

- type：提交类型，例如 feat（新功能）、fix（修复）、chore（杂项任务）等。
- scope（可选）：功能的范围，比如某个模块或文件。
- message：简短描述本次提交的目的。

常见的提交类型包括：

- feat: 新特性
- fix: 修复 bug
- docs: 文档修改
- style: 代码格式相关的修改（不影响代码逻辑）
- refactor: 代码重构
- test: 添加或修改测试
- chore: 其他不影响源代码的修改（例如依赖更新）

fe-release 内部依赖的是 release-it，当前项目使用了 @release-it/conventional-changelog 插件， 所以需要遵循 conventional commits 规范

当项目发布后，会根据每一次提交的 commit 信息，生成 CHANGELOG.md 文件， 并根据 commit 信息生成 release 版本

比如，feat: Add Docs

changelog 会生成以下类似的md：

```md
### Features

- feat: Add Docs [#5](https://github.com/qlover/brainai-frontend/pull/5) [25dcc5](https://github.com/qlover/brainai-frontend/pull/5/commits/25dcc5d180604f5d46bd3f114cfe0eb01dd13b90)
```

也可以使用 commitlint + husky 来限制提交

如果你怕忘记，可以直接使用 fe-commit 命令来完成提交，他是可交互式的

### Commit Lint

当 git commit 时，会校验当前提交的代码是否符合 eslint + prettier 格式要求

当前项目使用 lint-staged 来限制提交的代码，仅检查暂存区的代码

**注意：** 当提交代码太多时会出现校验缓慢的情况，请避免一次提交过多的代码

## 子项目

### [create-brain-app](./packages/create-brain-app/README_zh.md)

```bash
npx create-brain-app
```

## 发布

**注意：** 发布时需要使用 npm，不能使用pnpm 和 yarn，因为 fe-release 内部依赖的是 relesae-it，而 release-it 仅支持 npm

并需要提供权限较高的 GITHUB_TOKEN，以及 NPM_TOKEN

下面以 `create-brain-app` 为例，介绍如何发布

当前项目是托管到 github 上的，所以需要使用 github workflow 的工作流

0. 在 .github/workflow 创建一个对应的 release.yml 文件

1. 提交代码并创建一个合并到 `main` 分支的 Merge PR

   如果当前提交中有 `packages/create-brain-app` 目录的修改，则触发 `workflows/general-check.yml` 会给当前 PR 打上 `changes:packages/create-brain-app` 标签(label)

2. 当前 Merge PR 被合并到 `main` 分支后，会触发 `workflows/release.yml`, 同样合并的PR必须有 `packages/create-brain-app/**` 的修改，否则不会触发

   - 当 `release-PR` 触发后，对应执行 `npm run release-pr:create-brain-app`，会使用 bot 身份创建一个 Release PR， 并打上 `CI-Release` 标签(label)， 并使用 commitlint 规则自动处理 `CHANGELOG.md` 和 `package.json` 的版本号
   - 当 Release PR 合并后，对应执行 `npm run release:create-brain-app`， 并发布 NPM 和 GitHub release, 并生成一个唯一的 tag

Release PR 会自动使用 patch 版本号

如果 .env(.env.local) 设置 FE_RELEASE 为 false 则会跳过发布

**注意：** 只有当PR有 `changes:packages/create-brain-app` 和 `CI-Release` 标签时，才会触发发布，当然也可以直接跳过所有步骤手动增加label来发布，也可以删除label来取消发布
