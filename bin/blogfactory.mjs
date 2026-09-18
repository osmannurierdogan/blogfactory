#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as clack from '@clack/prompts';
import { copyTemplate } from './copy-template.mjs';
import { renderBrandConfig } from './render-brand-config.mjs';

const templateRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function exitOnCancel(value) {
  if (clack.isCancel(value)) {
    clack.cancel('Cancelled.');
    process.exit(1);
  }
  return value;
}

async function promptAnswers(cliTargetDir) {
  const brandName = exitOnCancel(
    await clack.text({
      message: 'Brand name?',
      placeholder: 'The Modern Stoic',
      validate: (value) => (value.trim() ? undefined : 'Required'),
    }),
  );

  const tagline = exitOnCancel(
    await clack.text({
      message: 'Tagline?',
      placeholder: 'Ancient wisdom for modern leaders',
      validate: (value) => (value.trim() ? undefined : 'Required'),
    }),
  );

  const domain = exitOnCancel(
    await clack.text({
      message: 'Domain (no protocol)?',
      placeholder: 'themodernstoic.co',
      validate: (value) => (value.trim() ? undefined : 'Required'),
    }),
  );

  const storeUrl = exitOnCancel(
    await clack.text({ message: 'Store URL?', initialValue: `https://store.${domain}` }),
  );

  const language = exitOnCancel(
    await clack.select({
      message: 'Language?',
      options: [
        { value: 'en', label: 'English' },
        { value: 'tr', label: 'Türkçe' },
      ],
    }),
  );

  const primary = exitOnCancel(await clack.text({ message: 'Primary color (hex)?', initialValue: '#1c1c1a' }));
  const secondary = exitOnCancel(await clack.text({ message: 'Secondary color (hex)?', initialValue: '#8a8478' }));
  const accent = exitOnCancel(await clack.text({ message: 'Accent color (hex)?', initialValue: '#b08d57' }));
  const background = exitOnCancel(await clack.text({ message: 'Background color (hex)?', initialValue: '#faf9f6' }));
  const text = exitOnCancel(await clack.text({ message: 'Text color (hex)?', initialValue: '#1c1c1a' }));

  const headingFont = exitOnCancel(
    await clack.text({ message: 'Heading font (must have an @fontsource package)?', initialValue: 'Fraunces' }),
  );
  const bodyFont = exitOnCancel(
    await clack.text({ message: 'Body font (must have an @fontsource package)?', initialValue: 'Inter' }),
  );

  const targetDirInput =
    cliTargetDir ??
    exitOnCancel(
      await clack.text({ message: 'Project directory?', initialValue: slugify(brandName) }),
    );

  const shouldGitInit = exitOnCancel(
    await clack.confirm({ message: 'Initialize a git repository?', initialValue: true }),
  );
  const shouldInstall = exitOnCancel(
    await clack.confirm({ message: 'Run pnpm install now?', initialValue: true }),
  );

  return {
    brandName,
    tagline,
    domain,
    storeUrl,
    language,
    colors: { primary, secondary, accent, background, text },
    fonts: { heading: headingFont, body: bodyFont },
    targetDirInput,
    shouldGitInit,
    shouldInstall,
  };
}

async function writeEnv(targetDir, domain) {
  const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8');
  const env = envExample.replace(/^PUBLIC_SITE_URL=.*$/m, `PUBLIC_SITE_URL=https://${domain}`);
  await writeFile(path.join(targetDir, '.env'), env);
}

async function writePackageJson(targetDir, name) {
  const pkg = JSON.parse(await readFile(path.join(targetDir, 'package.json'), 'utf8'));
  pkg.name = name;
  pkg.version = '0.0.1';
  delete pkg.bin;
  delete pkg.scripts?.create;
  delete pkg.dependencies?.['@clack/prompts'];
  await writeFile(path.join(targetDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
}

async function main() {
  clack.intro('blogfactory');

  const answers = await promptAnswers(process.argv[2]);
  const targetDir = path.resolve(process.cwd(), answers.targetDirInput);

  if (existsSync(targetDir)) {
    clack.cancel(`"${answers.targetDirInput}" already exists. Choose a different directory.`);
    process.exit(1);
  }

  const spinner = clack.spinner();

  spinner.start('Copying template');
  await mkdir(targetDir, { recursive: true });
  await copyTemplate(templateRoot, targetDir);
  spinner.stop('Template copied');

  spinner.start('Writing brand config, .env, and package.json');
  await writeFile(
    path.join(targetDir, 'src/config/brand.config.ts'),
    renderBrandConfig(answers),
  );
  await writeEnv(targetDir, answers.domain);
  await writePackageJson(targetDir, slugify(answers.brandName));
  spinner.stop('Brand config, .env, and package.json written');

  if (answers.shouldGitInit) {
    spinner.start('Initializing git repository');
    await run('git', ['init'], targetDir);
    spinner.stop('Git repository initialized');
  }

  if (answers.shouldInstall) {
    spinner.start('Installing dependencies (pnpm install)');
    await run('pnpm', ['install'], targetDir);
    spinner.stop('Dependencies installed');
  }

  const nextSteps = [
    `cd ${answers.targetDirInput}`,
    ...(answers.shouldInstall ? [] : ['pnpm install']),
    'fill in .env with your Notion/analytics/Beehiiv credentials',
    'pnpm dev',
  ];

  clack.outro(`Done! Next steps:\n  ${nextSteps.join('\n  ')}`);
}

main().catch((error) => {
  clack.cancel(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
