import { Command, OptionValues } from 'commander';
import pkg from '../package.json';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import inquirer, { DistinctQuestion } from 'inquirer';
import { oraPromise } from 'ora';
import { readdirSync } from 'node:fs';
import { Copyer } from './Copyer';

type GeneratorContext = {
  logger: typeof console;
  dryRun: boolean;
  verbose: boolean;
  options: {
    templateRootPath: string;
    templates: string[];
    ora: typeof oraPromise;
    projectName: string;
    templateName: string;
  };
};

type GeneratorPrompt = DistinctQuestion;

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPTS = {
  projectName() {
    return {
      type: 'input',
      name: 'projectName',
      message: 'Create Project Name?',
      validate: (value) => {
        const invalidChars = /[<>:"/\\|?*\x00-\x1F!@#$%^&*()+=\[\]{};':"\\|,.<>\/?~]/;
        if (invalidChars.test(value)) {
          return 'Name contains invalid characters for a directory';
        }
        if (value.length < 3) {
          return 'Name must be at least 3 characters long';
        }
        return true;
      }
    } as DistinctQuestion;
  },
  templateName(templates: string[]) {
    return {
      type: 'list',
      name: 'templateName',
      message: 'Choose Template Name?',
      choices: templates
    } as DistinctQuestion;
  }
};

/**
 * Get command line arguments
 * @returns
 */
function getCommandArgs() {
  const program = new Command(pkg.name)
    .version(
      pkg.version,
      '-v, --version',
      'Output the current version of create-brain-app.'
    )
    // .option(
    //   '-d, --dry-run',
    //   'Do not touch or write anything, but show the commands'
    // )
    // .option('-V, --verbose', 'Show more information')
    // .option('-n, --name <name>', 'The name of the test')
    .parse(process.argv);

  return program.opts();
}

/**
 * Create script context
 * @param args
 * @returns
 */
function createContext(args: OptionValues): GeneratorContext {
  const templateRootPath = resolve(__dirname, '../templates');
  const templates = readdirSync(templateRootPath);

  // FIXME: use scripts context
  return Object.assign(args, {
    logger: console,
    options: {
      ...args.options,
      templateRootPath,
      ora: oraPromise,
      templates
    }
  }) as unknown as GeneratorContext;
}

/**
 * Run prompts and return answers
 * @param context
 * @param prompts
 * @returns
 */
async function actions(
  prompts: GeneratorPrompt[]
): Promise<Record<string, unknown>> {
  try {
    const answers = await inquirer.prompt(prompts);

    return answers;
  } catch (error) {
    if ((error as Record<string, boolean>).isTtyError) {
      // Prompt couldn't be rendered in the current environment
    }

    throw error;
  }
}

/**
 * Generate project
 * @param context
 */
function generateProject(context: GeneratorContext) {
  const sourcePath = resolve(
    context.options.templateRootPath,
    context.options.templateName
  );

  const targetPath = resolve(process.cwd(), context.options.projectName);
  const copyer = new Copyer(targetPath);

  return copyer.copyPaths({ sourcePath, targetPath });
}

async function main() {
  const args = getCommandArgs();
  const context = createContext(args);

  const actionsResult = await actions([
    PROMPTS.projectName(),
    PROMPTS.templateName(context.options.templates)
  ]);

  Object.assign(context.options, actionsResult);

  // generate project
  await generateProject(context);
}

async function catchError(reason: { command?: string }) {
  console.log();
  console.error('Create brain app failed.');
  if (reason.command) {
    console.error(reason.command);
  }
  console.log();
  process.exit(1);
}

main().catch(catchError);
