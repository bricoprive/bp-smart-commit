# BP Smart Commits

A Node.js git hook script to prefix commits automatically with the commit type (feat, fix, breaking) and the JIRA ticket ID, based on a branch name.

## Usage

### Installation
1. Install [Husky](https://www.npmjs.com/package/husky) in your project to configure Git hooks easily
    ```
    npm install --save-dev husky
    ```
2. Install this package in your project:
    ```
    npm install --save-dev bp-smart-commit
    ```
3. Configure scripts in `package.json`. The script expects his first argument to be the JIRA tag of the project.
    ```
    "commit-msg": "bp-smart-commit SPAN"
    ```
    or environment variables 
      
      - TAG_MATCHER - regular expression
      - TAG_MATCH_INDEX - match index
      - DEBUG - if true will console log some data about branch, matches array etc
      
    example: if your branches have feature/SPAN-1234/some-description template
    ```
    "commit-msg": "TAG_MATCHER=\"^[^/]+/(SPAN-[0-9]+)\" TAG_MATCH_INDEX=1 bp-smart-commit"
    ```
    
    
4. Do your git commits like usual. If the branch was prefixed with a JIRA tag, your commit message will get prefixed with
the same tag.

```
Branch: TAG-411-husky-git-hooks
Commit message: "Add git hooks to project" → "TAG-411 Add git hooks to project"
```
