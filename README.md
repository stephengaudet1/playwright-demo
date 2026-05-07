# Welcome to a playwright demonstration repository

## project structure

```
<project root>
|   .env                            //static config goes here
|   .gitignore                      
|   .package-lock.json
|   .package.json
|   playwright.config.ts            
|   README.md
|   tsconfig.json
|   .github
    |   workflows
        |   playwright.yml          
|   data                            //interfaces defining domain objects in here please
    |   interfaces.ts
|   extensions                      //extensions to the playwright framework like custom reporters etc. go in here please
    |   zephyrreporter.ts
|   fixtures                        
    |   endToEnd.ts                 //end to end fixture constructs the browsers for both Manager and Employee roles 
|   pages                           //page object models in here please
    |   *.ts
|   tests                           //tests in here please
    |   timeentry                   //data driven tests use a sub-folder of the same name as the spec
        |   *.json                  //each .json is a test case
    |   timeentry.spec.ts           //data driven test for end to end time card submission
|   utils
    |   dateutils.ts

```
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
