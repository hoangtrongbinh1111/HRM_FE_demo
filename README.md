# Table of Contents

-   [Table of Contents](#table-of-contents)
    -   [Technologies](#technologies)
    -   [Installation \& Setup](#installation--setup)
        -   [Clone code](#clone-code)
        -   [Install packages](#install-packages)
    -   [Running the app](#running-the-app)
    -   [Folder Structure](#folder-structure)
    -   [Coding Convention](#coding-convention)
        -   [Naming](#naming)
        -   [Code](#code)
    -   [Git branches](#git-branches)

## Technologies

<p align="left">
   <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white">
    <img src="https://img.shields.io/badge/node.js v16.15.0-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white">
     <img src="https://img.shields.io/badge/yarn v1.22.19-%2300758F.svg?style=for-the-badge&logo=yarn&logoColor=white">
   <img src="https://img.shields.io/badge/tailwind-52B0E7.svg?style=for-the-badge&logo=tailwindcss&logoColor=white">
  </p>
</div>

## Installation & Setup

#### Clone code
npm 
```bash
$ git clone https://github.com/vangtatlaos/QLNS_FE
```

#### Install packages

```bash
$ cd QLNS_FE
```

```bash
$ npm install/ yarn install
```

## Running the app

```bash
$ npm run dev/ yarn run dev
```

-   local app: http://127.0.0.1:8686/

## Folder Structure

```
public
src
├──@core
│   ├── call-api
│   ├── configs
│   │   ├── index.tsx
│   │   ├── env
│   ├── hooks
│   ├── rbac
├── assets
├── components
├── config
├── pages
├── services
```

## Coding Convention

### Naming

-   Component Name: **`PascalCase`**. Ex: `HeaderTop`, `BlankLayout`
-   File name: **`PascalCase`**.(name the file as React component in that file)
-   Class name: **`PascalCase`**. Ex: `UserController`, `UserDataService`
-   Method/ Function name: **`camelCase`** (start with verbs). Ex: `getUser`, `getCategory`
-   Variety: **`camelCase`**. Ex: `firstName`, `lastName`
-   Constants: **`LIST_CONSTANTS`**. Ex: `LIMIT_STATUS`, `LIST_ROLE`

### Code

-   Remove unnecessary commented out code
-   Remove the console.logs before commit
-   Avoid multiple if-else blocks, instead use ternary

## Git branches

-   `main` for Production
-   `dev` for Development
-   `feat/*` for features (new features, new APIs, etc., check out from `dev` branch)
-   `fix/*` for bug fixes (fix bugs, fix errors, etc., check out from `dev` branch)
-   `chore/*` for common changes (update README.md, update .gitignore, etc., check out from `dev` branch)

    <sub>Maybe we will have `stg` branch for staging environment in the future. (if we or clients have budget)</sub>

`feat/*` and `fix/*` will be created from `dev` branch and will be merged into `dev` branch.

`dev` branch will be merged into `main` branch.

Create pull request to merge `feat/*`, `fix/*` and `chore/*` branches into `dev`branch and`dev`branch into`main` branch.

**Note 1**: Please don't push directly to `main` branch and `dev` branch.

**Note 2**: In progress commit should have suffix `[WIP]` in commit message. Ex: `chore: Update README.md [WIP]`
