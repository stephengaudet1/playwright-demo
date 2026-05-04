# Welcome to PLATO's certinia-playwright repository

## workstation setup
### install nodeJS
It is recommended to install Node Version Manager [NVM](https://github.com/coreybutler/nvm-windows/releases) and use it to manage nodejs versions on your workstation. After installing NVM:
```sh
nvm install 22.11.0
nvm use 22.11.0
```
### install dependencies
From the base directory of this repository, install packages:
```sh
npm ci
```
and the Playwright browsers:
```sh
npx playwright install --with-deps
```
### vscode extensions
It is recommended to use vscode as the IDE, with the following extensions installed:
* `ESLint` by Microsoft
* `Playwright Test for VSCode` by Microsoft
## developing tests
type check code changes:
```sh
npx tsc --noEmit
```
run all tests in the `tests` directory:
```sh
npx playwright test
```
run a single test titled `foo` with a headed browser:
```sh
npx playwright test -g "foo" --headed
```

run a single test file with a headed browser:
```sh
npx playwright test tests/todo-page.spec.ts --headed
```
