# brainai frontend

A private monorepo for managing brainai's frontend projects

## Directory Structure

```bash
├── .github/ # GitHub config files
│ ├── workflows/ # GitHub Actions workflows
├── .vscode/ # VSCode config files
├── .husky/ # husky config files
├── packages/
│ ├── create-brain-app/ # create app tool package
├── .gitignore # Git ignore files
├── package.json # project config file
└── README.md # project description file
```

## Project Pre-Check

### Commit Message Lint

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to standardize commit messages

Conventional Commits is a commit message convention that suggests each Git commit message should follow a certain format. The basic format is as follows:

For example:

```bash
<type>(<scope>): <message>
```

- type: The type of the commit, such as feat (new feature), fix (bug fix), chore (other changes that don't affect the code).
- scope (optional): The scope of the feature, such as a module or file.
- message: A brief description of the purpose of this commit.

Common commit types include:

- feat: New feature
- fix: Bug fix
- docs: Document modification
- style: Code formatting related changes (do not affect code logic)
- refactor: Code refactoring
- test: Add or modify tests
- chore: Other changes that do not affect the source code (such as dependency updates)

fe-release internally depends on release-it, and the current project uses the @release-it/conventional-changelog plugin, so it is necessary to follow the conventional commits specification

When the project is released, it will generate the CHANGELOG.md file based on the commit information of each commit, and generate the release version based on the commit information

For example, feat: Add Docs

The changelog will generate the following similar md:

```md
### Features

- feat: Add Docs [#5](https://github.com/qlover/brainai-frontend/pull/5) [25dcc5](https://github.com/qlover/brainai-frontend/pull/5/commits/25dcc5d180604f5d46bd3f114cfe0eb01dd13b90)
```

You can also use commitlint + husky to restrict commits

If you are afraid of forgetting, you can directly use the fe-commit command to complete the commit, it is interactive

### Commit Lint

When git commit, it will check whether the current commit code meets the eslint + prettier format requirements

The current project uses lint-staged to restrict the code that can be committed, only checking the code in the staging area

**Note:** When there are too many commits, the verification will be slow, please avoid submitting too many code at once

## Sub-projects

### [create-brain-app](./packages/create-brain-app/README.md)

```bash
npx create-brain-app
```

## Release

**Note:** When releasing, you need to use npm, not pnpm or yarn, because fe-release internally depends on relesae-it, and release-it only supports npm

And you need to provide a higher permission GITHUB_TOKEN, as well as NPM_TOKEN

Below is an example of how to release `create-brain-app`

The current project is hosted on github, so you need to use the github workflow workflow

0. Create a corresponding release.yml file in the .github/workflow directory

1. Submit code and create a Merge PR merged into the `main` branch

   If the current commit has modifications to the `packages/create-brain-app` directory, the `workflows/general-check.yml` will trigger and add the `changes:packages/create-brain-app` label to the current PR

2. When the current Merge PR is merged into the `main` branch, the `workflows/release.yml` will be triggered, the merged PR must have modifications to `packages/create-brain-app/**`, otherwise it will not be triggered

   - When the `release-PR` is triggered, execute `npm run release-pr:create-brain-app`, it will use the bot identity to create a Release PR, and add the `CI-Release` label, and use the commitlint rule to automatically process the version number of `CHANGELOG.md` and `package.json`
   - When the Release PR is merged, execute `npm run release:create-brain-app`, and release NPM and GitHub release, and generate a unique tag

Release PR will automatically use the patch version number

If the .env(.env.local) setting of FE_RELEASE is false, the release will be skipped

**Note:** Only when the PR has the `changes:packages/create-brain-app` and `CI-Release` labels will the release be triggered, of course, you can also skip all steps and manually add labels to release, or delete labels to cancel the release
