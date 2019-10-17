#!/usr/bin/env node

const fs = require("fs")

/**
* If commit message title:
*   - Doesn't start with Merge branch
*   - Doesn't start with Merge pull request
*   - Branch name starts with ${type}/JIRATAG-XXX/short-description (e.g. feat/TAG-123/branch-description)
*   - Branch name is not a forbidden branch (master)
* then prepend the commit type and JIRA issue tag to the commit message.
* E.g My awesome commit -> feat TAG-123: My awesome commit
*/

/**
* @param {string} commitMessage
* @returns {boolean}
*/
const isInvalidMessage = (commitMessage) => {
  const startsWithMergeBranch = (commitMessage) => commitMessage.indexOf("Merge branch") === 0
  const startsWithMergePR = (commitMessage) => commitMessage.indexOf("Merge pull request") === 0
  return !startsWithMergeBranch(commitMessage) && !startsWithMergePR(commitMessage)
}

/**
* @returns {string}
*/
const getBranchName = () => {
  const branchName = fetchBranchNameFromGit()
  if (["master"].includes(branchName)) {
    console.error(`Stop right here! You cannot commit directly to '${branchName}'. Please set up a PR to 'master' from GitHub and merge from there`)
    process.exit(1)
  }
  return branchName
}

/**
* @returns {String}
*/
const fetchBranchNameFromGit = () => {
  return require("child_process").execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).split("\n")[0]
}

const validCommitTypes = [
  'feat',
  'improvement',
  'fix',
  'docs',
  'perf',
  'build',
  'ci',
  'refactor',
  'style',
  'test',
  'chore',
]

/**
* @param {string} branchName
* @returns {object}
*/
const getBranchInfos = (branchName) => {
  const tagMatcherWithContext = new RegExp(`^[^/]+/[A-Z]+-[0-9]+/[a-z-]+`, "i")
  const tagMatcherWithoutContext = new RegExp(`^[^/]+/[a-z-]+`, "i")
  const matchedWithContext = branchName.match(tagMatcherWithContext)
  const matchedWithoutContext = branchName.match(tagMatcherWithoutContext)
  
  
  let branchInfos
  
  if (matchedWithContext) {
    const matchedInfos = matchedWithContext[0].split('/')
    if (!validCommitTypes.includes(matchedInfos[0])) return false
    
    branchInfos = {
      type: matchedInfos[0],
      context: matchedInfos[1]
    }
  } else if (matchedWithoutContext) {
    const matchedInfos = matchedWithoutContext[0].split('/')
    if (!validCommitTypes.includes(matchedInfos[0])) return false
    
    branchInfos = {
      type: matchedInfos[0]
    }
  }
  
  return branchInfos
}

const commitMsgFile = process.env.GIT_PARAMS || process.env.HUSKY_GIT_PARAMS
const commitMsg = fs.readFileSync(commitMsgFile, { encoding: "utf-8" })
const branchName = getBranchName()
const branchInfos = getBranchInfos(branchName)
const rawCommitMsgTitle = commitMsg.split("\n")[0]

if (branchInfos && branchInfos.type && isInvalidMessage(rawCommitMsgTitle)) {
  // Format the commit message / body
  const { type, context } = branchInfos
  const messageLines = commitMsg.split("\n")
  const commitTitlePrefix = type + (context ? `(${context})` : '')
  messageLines[0] = `${commitTitlePrefix}: ${rawCommitMsgTitle}`
  fs.writeFileSync(commitMsgFile, messageLines.join("\n"), { encoding: "utf-8" })
} else {
  fs.writeFileSync(commitMsgFile, commitMsg, { encoding: "utf-8" })
}
