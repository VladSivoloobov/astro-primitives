#!/usr/bin/env node

import { appendFile, copyFile, mkdir, access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const componentFiles = {
  badge: 'Badge.astro',
  button: 'Button.astro',
  card: 'Card.astro',
  container: 'Container.astro',
  footer: 'Footer.astro',
  gridlayout: 'GridLayout.astro',
  header: 'Header.astro',
  input: 'Input.astro',
  logo: 'Logo.astro',
  section: 'Section.astro',
  separator: 'Separator.astro',
  skeleton: 'Skeleton.astro',
  stack: 'Stack.astro',
  textarea: 'Textarea.astro',
} as const;

const utilityFiles = {
  tv: 'tv.ts',
} as const;

const themeFiles = {
  theme: 'theme.css',
} as const;

type ComponentName = keyof typeof componentFiles;
type UtilityName = keyof typeof utilityFiles;
type ThemeName = keyof typeof themeFiles;
type AddableName = ComponentName | UtilityName | ThemeName;

const componentDependencies: Partial<Record<ComponentName, UtilityName[]>> = {
  badge: ['tv'],
  button: ['tv'],
  card: ['tv'],
  gridlayout: ['tv'],
  header: ['tv'],
  input: ['tv'],
  section: ['tv'],
  skeleton: ['tv'],
  stack: ['tv'],
  textarea: ['tv'],
};

const componentsWithTheme: ComponentName[] = [
  'badge',
  'button',
  'card',
  'container',
  'input',
  'logo',
  'section',
  'separator',
  'skeleton',
  'textarea',
];

function printHelp() {
  console.log(`astro-primitives

Usage:
  astro-primitives add <component-or-utility...> [--overwrite]
  astro-primitives add --all [--overwrite]
  astro-primitives list

Components and utilities: ${[...Object.keys(componentFiles), ...Object.keys(utilityFiles), ...Object.keys(themeFiles)].join(', ')}`);
}

function printList() {
  for (const name of [
    ...Object.keys(componentFiles),
    ...Object.keys(utilityFiles),
    ...Object.keys(themeFiles),
  ].sort()) {
    console.log(name);
  }
}

function getTemplateDirectories(sourcePath: string) {
  const entryPoint = process.argv[1];
  if (!entryPoint) {
    throw new Error('Unable to locate the astro-primitives executable.');
  }

  const entryDirectory = dirname(resolve(entryPoint));
  return [
    join(entryDirectory, 'src', sourcePath),
    join(entryDirectory, '..', 'src', sourcePath),
  ];
}

async function findTemplateDirectory(sourcePath: string) {
  for (const directory of getTemplateDirectories(sourcePath)) {
    try {
      await access(directory, constants.R_OK);
      return directory;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    'Could not find the component templates. Reinstall astro-primitives and try again.',
  );
}

async function addComponents(args: string[]) {
  let overwrite = false;
  let addAll = false;
  const names: string[] = [];

  for (const arg of args) {
    if (arg === '--overwrite') {
      overwrite = true;
    } else if (arg === '--all') {
      addAll = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      return;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      names.push(arg.toLowerCase());
    }
  }

  if (addAll && names.length > 0) {
    throw new Error('Use either --all or component names, not both.');
  }

  const requestedNames = addAll
    ? [
        ...Object.keys(componentFiles),
        ...Object.keys(utilityFiles),
        ...Object.keys(themeFiles),
      ]
    : names;
  if (requestedNames.length === 0) {
    throw new Error('Choose at least one component or use --all.');
  }

  const validNames = requestedNames.filter(
    (name): name is AddableName =>
      Object.hasOwn(componentFiles, name) ||
      Object.hasOwn(utilityFiles, name) ||
      Object.hasOwn(themeFiles, name),
  );
  if (validNames.length !== requestedNames.length) {
    const invalidNames = requestedNames.filter(
      (name) =>
        !Object.hasOwn(componentFiles, name) &&
        !Object.hasOwn(utilityFiles, name) &&
        !Object.hasOwn(themeFiles, name),
    );
    throw new Error(
      `Unknown component or utility${invalidNames.length > 1 ? 's' : ''}: ${invalidNames.join(', ')}. Run "astro-primitives list" to see available items.`,
    );
  }

  const utilityNames = new Set<UtilityName>(
    validNames.filter(
      (name): name is UtilityName => Object.hasOwn(utilityFiles, name),
    ),
  );
  const requestedComponents = validNames.filter(
    (name): name is ComponentName => Object.hasOwn(componentFiles, name),
  );
  for (const name of requestedComponents) {
    for (const dependency of componentDependencies[name] ?? []) {
      utilityNames.add(dependency);
    }
  }
  const addTheme =
    validNames.some((name): name is ThemeName => Object.hasOwn(themeFiles, name)) ||
    requestedComponents.some((name) => componentsWithTheme.includes(name));

  const filesToAdd = [
    ...validNames
      .filter((name): name is ComponentName => Object.hasOwn(componentFiles, name))
      .map((name) => ({
        filename: componentFiles[name],
        sourcePath: join('components', 'ui'),
        targetPath: join('components', 'ui'),
      })),
    ...[...utilityNames].map((name) => ({
      filename: utilityFiles[name],
      sourcePath: 'utils',
      targetPath: 'utils',
    })),
    ...(addTheme
      ? [{
        filename: themeFiles.theme,
        sourcePath: '',
        targetPath: '',
      }]
      : []),
  ];

  for (const file of filesToAdd) {
    const templateDirectory = await findTemplateDirectory(file.sourcePath);
    const targetDirectory = resolve(process.cwd(), 'src', file.targetPath);
    await mkdir(targetDirectory, { recursive: true });
    const source = join(templateDirectory, file.filename);
    const filename = 'outputFilename' in file ? file.outputFilename : file.filename;
    const target = join(targetDirectory, filename);

    try {
      await copyFile(
        source,
        target,
        overwrite ? 0 : constants.COPYFILE_EXCL,
      );
      console.log(`Added ${join('src', file.targetPath, filename)}`);
    } catch (error) {
      if (!overwrite && error instanceof Error && 'code' in error && error.code === 'EEXIST') {
        console.log(`Skipped ${join('src', file.targetPath, filename)} (already exists)`);
        continue;
      }
      throw error;
    }
  }

  if (addTheme) {
    const globalStylesheet = resolve(process.cwd(), 'src', 'global.css');
    const themeImport = "@import './theme.css';";
    let contents: string | undefined;
    try {
      contents = await readFile(globalStylesheet, 'utf8');
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error;
      }
    }
    if (contents === undefined) {
      const templateDirectory = await findTemplateDirectory('');
      await copyFile(
        join(templateDirectory, 'global.css'),
        globalStylesheet,
        constants.COPYFILE_EXCL,
      );
      console.log(`Added ${join('src', 'global.css')}`);
    } else if (!contents.includes(themeImport)) {
      const separator = contents && !contents.endsWith('\n') ? '\n' : '';
      await appendFile(globalStylesheet, `${separator}${themeImport}\n`);
      console.log(`Added ${join('src', 'global.css')} theme import`);
    }
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'add') {
    await addComponents(args);
    return;
  }

  if (command === 'list') {
    printList();
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h' || !command) {
    printHelp();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
