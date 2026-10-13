import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const cli = fileURLToPath(new URL('../dist/main.js', import.meta.url));
const componentDirectory = join('src', 'components', 'ui');

function runCli(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

function withTemporaryProject(run) {
  const project = mkdtempSync(join(tmpdir(), 'astro-primitives-'));
  try {
    run(project);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}

test('lists available components and utilities', () => {
  const result = runCli(['list'], process.cwd());

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split(/\r?\n/), [
    'badge',
    'box',
    'button',
    'container',
    'footer',
    'gridlayout',
    'header',
    'input',
    'logo',
    'section',
    'separator',
    'skeleton',
    'stack',
    'textarea',
    'theme',
    'title',
    'tv',
  ]);
});

test('adds components and preserves local edits unless overwrite is requested', () => {
  withTemporaryProject((project) => {
    let result = runCli(['add', 'button', 'badge'], project);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      readFileSync(join(project, 'src', 'utils', 'tv.ts'), 'utf8'),
      /tailwind-variants/,
    );
    assert.match(
      readFileSync(join(project, 'src', 'global.css'), 'utf8'),
      /@import 'tailwindcss';/,
    );
    assert.match(
      readFileSync(join(project, 'src', 'global.css'), 'utf8'),
      /@custom-variant xl/,
    );
    assert.match(
      readFileSync(join(project, 'src', 'global.css'), 'utf8'),
      /@import '\.\/theme\.css';/,
    );

    const button = join(project, componentDirectory, 'Button.astro');
    writeFileSync(button, 'local edit');

    result = runCli(['add', 'button'], project);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(button, 'utf8'), 'local edit');

    result = runCli(['add', 'button', '--overwrite'], project);
    assert.equal(result.status, 0, result.stderr);
    assert.match(readFileSync(button, 'utf8'), /inline-flex/);

    result = runCli(['add', '--all'], project);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readdirSync(join(project, componentDirectory)).length, 15);
    assert.equal(readdirSync(join(project, 'src', 'utils')).length, 1);
    assert.equal(
      readFileSync(join(project, 'src', 'theme.css'), 'utf8').includes(
        '--primary:',
      ),
      true,
    );
  });
});

test('adds the tv utility directly', () => {
  withTemporaryProject((project) => {
    const result = runCli(['add', 'tv'], project);

    assert.equal(result.status, 0, result.stderr);
    assert.match(
      readFileSync(join(project, 'src', 'utils', 'tv.ts'), 'utf8'),
      /export const tv = createTv/,
    );
  });
});

test('tv exports a configured createTV instance with theme tokens', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--input-type=module',
      '-e',
      `import { tv } from './src/utils/tv.ts';
const button = tv({ base: 'bg-primary text-foreground px-container-padding' });
console.log(button({ class: 'bg-secondary text-primary px-section-padding-lg' }));`,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout.trim(),
    'bg-secondary text-primary px-section-padding-lg',
  );
});

test('stack supports horizontal and vertical orientations', () => {
  const stack = readFileSync(
    join(process.cwd(), 'src', 'components', 'ui', 'Stack.astro'),
    'utf8',
  );

  assert.match(stack, /orientation:\s*\{/);
  assert.match(stack, /vertical:\s*'flex-col'/);
  assert.match(stack, /horizontal:\s*'flex-row'/);
  assert.match(stack, /as\?:\s*'div'\s*\|\s*'ul'\s*\|\s*'ol'/);
  assert.match(stack, /as:\s*Element\s*=\s*'div'/);
});

test('grid layout supports div, ul, and ol root elements', () => {
  const gridLayout = readFileSync(
    join(process.cwd(), 'src', 'components', 'ui', 'GridLayout.astro'),
    'utf8',
  );

  assert.match(gridLayout, /as\?:\s*'div'\s*\|\s*'ul'\s*\|\s*'ol'/);
  assert.match(gridLayout, /as:\s*Element\s*=\s*'div'/);
});

test('adds the theme when installing layout components', () => {
  withTemporaryProject((project) => {
    const result = runCli(['add', 'container'], project);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      readFileSync(
        join(project, 'src', 'components', 'ui', 'Container.astro'),
        'utf8',
      ).includes(
        'max-w-(--container-max-width) px-(--container-padding) sm:px-(--container-padding-sm) lg:px-(--container-padding-lg)',
      ),
      true,
    );
    assert.match(
      readFileSync(join(project, 'src', 'theme.css'), 'utf8'),
      /--container-max-width:/,
    );
    assert.match(
      readFileSync(join(project, 'src', 'theme.css'), 'utf8'),
      /--container-padding-lg:/,
    );
    assert.match(
      readFileSync(join(project, 'src', 'global.css'), 'utf8'),
      /@import 'tailwindcss';/,
    );
    assert.match(
      readFileSync(join(project, 'src', 'global.css'), 'utf8'),
      /@custom-variant xl/,
    );
    assert.equal(readdirSync(join(project, 'src')).includes('utils'), false);
  });
});

test('adds theme tokens without overwriting global CSS', () => {
  withTemporaryProject((project) => {
    const globalStylesheet = join(project, 'src', 'global.css');
    const themeStylesheet = join(project, 'src', 'theme.css');
    mkdirSync(join(project, 'src'), { recursive: true });
    writeFileSync(globalStylesheet, '/* app styles */');

    const result = runCli(['add', 'theme'], project);

    assert.equal(result.status, 0, result.stderr);
    assert.match(
      readFileSync(globalStylesheet, 'utf8'),
      /^\/\* app styles \*\/\r?\n@import '\.\/theme\.css';/,
    );
    assert.match(readFileSync(themeStylesheet, 'utf8'), /--primary:/);
  });
});

test('rejects unknown components', () => {
  withTemporaryProject((project) => {
    const result = runCli(['add', 'not-a-component'], project);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown component/);
  });
});
