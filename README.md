# BP Smart Commits

A Node.js git hook script to prefix commits automatically with the commit type (feat, fix, etc ...) and the context, based on the branch name and the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/).

## Restrictions

### Branch naming
Your branch other than protected / ignored (see below) must follow a naming format: 
- With context: `{type}/{context}/{short-description}`
- Without context: `{type}/{short-description}`

Type must be one of the following:
  - **feat**: A new feature
  - **improvement**: A feature improvement
  - **fix**: A bug fix
  - **docs**: Documentation only changes
  - **perf**: A code change that improves performance
  - **build**: Changes that affect the build system or external dependencies (example scopes: gulp, yarn)
  - **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
  - **refactor**: A code change that neither fixes a bug nor adds a feature
  - **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - **test**: Adding missing tests or correcting existing tests
  - **chore**: Improving the code base so that it can be worked with more easily

Must respect the following regex:
- Context: `[A-Za-z-]+`
- Short description: `[a-z-]+`

### Protected branches
You cannot commit on the following branches: 
- `master`

### Ignored branches
The following branches are ignored, so be sure that only maintainers will be able to push to them: 
- `dev`
- `develop`

## Usage

### Installation
1. Install [Husky](https://www.npmjs.com/package/husky) in your project to configure Git hooks easily
    ```
    yarn add --dev husky
    ```
2. Install this package in your project:
    ```
    yarn add --dev bp-smart-commit
    ```
3. Configure scripts in `package.json`.
    ```
    "husky": {
      "hooks": {
        "commit-msg": "bp-smart-commit"
      }
    }
    ```    

4. Do your git commits like usual.

## Examples
```
Branch: docs/improved-readme
Commit message: "Improved README" → "docs: Improved README"
```

```
Branch: chore/TAG-411/husky-git-hooks
Commit message: "Add git hooks to project" → "chore(TAG-411): Add git hooks to project"
```

```
Branch: docs/TAG-518/changelog-spelling
Commit message: "Correct spelling of CHANGELOG" → "docs(TAG-518): Correct spelling of CHANGELOG"
```

## TODO

- [ ] Check that commits to `dev` / `develop` are already formatted correctly (add `release` type ?)