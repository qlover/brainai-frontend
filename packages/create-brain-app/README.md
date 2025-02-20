# Create Brain App

`create-brain-app` is a command line tool for quickly creating React and AI applications. It provides a complete project template to help developers quickly start projects.

## Features

- **Quick Start**：Generate a complete project structure with simple command line operations.
- **Flexible Template Selection**：Support multiple project templates to meet different development needs.
- **Non-interactive Mode**：Support non-interactive project creation through command line parameters.

## Installation

You can choose to use `npx` to run directly, or globally install `create-brain-app`.

### Use npx

```bash
npx create-brain-app
```

### Global Installation

```bash
npm install -g create-brain-app
```

Then use the following command to create a project:

```bash
create-brain-app
```

This will create a new folder named `<project-name>` in the current directory and generate a project template in it.

## Usage

### Create a new project

1. **Interactive Creation**：Run `create-brain-app`, input the project name and select the template.
2. **Non-interactive Creation**：Use command line parameters to specify the project name and template. (Not supported yet)

### View help

You can also create a new project in a non-interactive way through command line parameters. Please refer to `create-brain-app --help`:

```bash
Usage: create-brain-app [options]

Options:
  -v, --version      Output the current version of create-brain-app.
  -h, --help         display help for command
```
