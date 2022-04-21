# Microbundle Typescript Starter Template

Opinionated template repository for creating Javascript libraries with Typescript, Microbundle, Jest, and a bunch of other tools.

<!-- toc -->

- [Motivation](#motivation)
- [Getting Started](#getting-started)
- [Compiling Typescript via Microbundle](#compiling-typescript-via-microbundle)
- [Development code](#development-code)
- [Testing via Jest](#testing-via-jest)
- [Linting via ESLint](#linting-via-eslint)
- [Formatting code via Prettier](#formatting-code-via-prettier)
- [Continuous Integration](#continuous-integration)
- [Git Hooks](#git-hooks)
- [Debugging](#debugging)
- [Managing versions via changesets](#managing-versions-via-changesets)
- [Generating API documentation](#generating-api-documentation)
- [Renovate Bot](#renovate-bot)
- [Publishing to NPM](#publishing-to-npm)
- [Package manager](#package-manager)

<!-- tocstop -->

## Motivation

Setting up a modern Typescript or Javascript development stack is a daunting task, there are a lot of moving parts, and sometimes the whole process seems like magic. I've maintained my babel configuration, and build process but it was getting tiresome to maintain, so I switched to [microbundle](https://github.com/developit/microbundle). While microbundle handles the compilation, there are a lot of other moving parts that need to be set up to start developing with Nodejs/Typescript (CI, test, etc).

This repository is actively maintained and as new versions of tools are being released it is updated and modified accordingly.

## Getting Started

You can immediately create your repo by clicking on the `Use this template button` in the Github page UI. Or you can use [deGit](https://github.com/Rich-Harris/degit) which is a very convenient tool to quickly download the repository (without git clone) `degit https://github.com/ivandotv/microbundle-template`

## Compiling Typescript via Microbundle

Typescript files are compiled via [Microbundle](https://github.com/developit/microbundle), there are two scripts (`build:dev` and `build:prod`)
Microbundle creates three bundles, `modern (es6)` `cjs` and `umd`. Also in the `exports` field in the package.json there are three keys:

- `development` - used by bundlers while developing
- `import` - es6 (module) build of the library
- `require` - Commonjs build of the library

## Development code

While in the development you have access to a few expressions, that will later be transformed via microbundle.

`__DEV__` expression: Write code that will be stripped out from the production build.

this code:

```js
if (__DEV__) {
  //dev only code
}
```

will generate:

```js
if (process.env.NODE_ENV !== 'production') {
  //dev only code
}
```

Which will later (in `production` mode) be resolved to:

```js
if (false) {
  //dev only code
}
```

And it will be removed from your `production` build.

There are also some other expressions that you can use:

- `__VERSION__` is replaced with the environment variable `PKG_VERSION` or with `package.json` `version` field.
- `__COMMIT_SHA__` is replaced with the short version of the git commit SHA from the HEAD.
- `__BUILD_DATE__` is replaced with the date of the commit from the HEAD.

## Testing via Jest

Jest is used for testing. You can write your tests in Typescript and they will be compiled via babel targeting the nodejs version that is running the tests. The testing environment is set to `node` you might want to change that if you need access to `DOM` in your tests (use `jsdom`).
I think there is no faster way to run typescript tests in jest. :)

The coverage threshold is set to `80%` globally.

One plugin is added to jest:

- `jest-watch-typeahead` (for filtering tests by file name or test name)

There are three tasks for running tests:

- `test` run all test and report code coverage
- `test:ci` is the same as `test` only optimized for CI (will not run in parallel)
- `test:watch` continuously run tests by watching some or all files

## Linting via ESLint

-ESLint is set up with a few plugins:

- `@typescript-eslint/eslint-plugin` for linting Typescript.
- `eslint-plugin-jest` for linting Jest test files
- `eslint-plugin-prettier` for prettier integration
- `eslint-plugin-promise` for linting promises
- `eslint-plugin-tsdoc` for linting TypeScript doc comments conform to the TSDoc specification.
- There are a few overrides that I think are common sense. You can see the overrides inside the [.eslintrc.js](.eslintrc.js) file.

You can also remove all the plugins that you don't need.

You can run ESLint via `lint` and `lint:check` scripts.

## Formatting code via Prettier

Prettier is set up not to conflict with `eslint`. You can run prettier via `format` and `format:check` scripts.

## Continuous Integration

Github actions are used for continuous integration and testing.
Github action name is `Test` and this is what it does:

- run on `push` to all branches
- run on `pull request` to `main` and `develop` branches
- run tests on node versions 12,14,16
- lint source
- build source
- run tests
- generate code coverage
- consume changesets
  - bump package versions
  - generate changelog
  - publish to npm
- generate API docs (from source code, only if the package is published)
- make a commit with new API docs.

## Git Hooks

There is one git hook setup via [husky](https://www.npmjs.com/package/husky) package in combination with [lint-staged](https://www.npmjs.com/package/lint-staged). Before committing the files all staged files will be run through ESLint and Prettier.

## Debugging

If you are using VS Code as your editor,
there are three debug configurations:

- `Main` debug the application by running the compiled `index.js` file.
- `Current test file` debug currently focused test file inside the editor.

## Managing versions via changesets

For maintaining package versions I'm using [changesets](https://github.com/changesets/changesets)

## Generating API documentation

You can generate API documentation from your source files via [typedoc](https://typedoc.org)(`pnpm gen:docs`).
Currently, documentation will be generated into `docs/api` directory and it is generated in markdown so it can be displayed on Github.

- Private class members are excluded.
- Declarations with `@internal` are excluded.
- Only exported properties are documented.

## Renovate Bot

There is a renovate bot configuration file for automatically updating dependencies. Make sure to active `renovate bot` first via [github marketplace.](https://github.com/marketplace/renovate)

## Publishing to NPM

Manual publishing is done via `pnpm release` this task will go through regular NPM publish steps and will call [`prepublishOnly` life cycle script](https://docs.npmjs.com/cli/v7/using-npm/scripts#life-cycle-scripts).

## Package manager

[pnpm](https://pnpm.io) is my package manager of choice. You can use something else, just make sure to update the scripts in package.json and change any references to pnpm.
