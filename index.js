#!/usr/bin/env node

const fs = require("fs");

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
    const startsWithMergeBranch = (commitMessage) => commitMessage.indexOf("Merge branch") === 0;
    const startsWithMergePR = (commitMessage) => commitMessage.indexOf("Merge pull request") === 0;
    return !startsWithMergeBranch(commitMessage) && !startsWithMergePR(commitMessage);
};

/**
 * @returns {string}
 */
const getBranchName = () => {
    const branchName = fetchBranchNameFromGit();
    if (["master"].includes(branchName)) {
        console.error(`Stop right here! You cannot commit directly to '${branchName}'. Please set up a PR to 'master' from GitHub and merge from there`);
        process.exit(1);
    }
    return branchName;
};

/**
 * @returns {String}
 */
const fetchBranchNameFromGit = () => {
    return require("child_process").execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).split("\n")[0]
};

const branchTypeToCommitType = {
  'feat': 'feat',
  'bug': 'fix',
  'fix': 'fix',
  'build': 'build',
  'ci': 'ci',
  'chore': 'chore',
  'docs': 'docs',
  'doc': 'docs',
  'perf': 'perf',
  'refactor': 'refactor',
  'revert': 'revert',
  'style': 'style',
  'test': 'test'
}

/**
 * @param {string} branchName
 * @returns {object}
 */
const getBranchInfos = (branchName) => {
  const tagMatcherWithJira = new RegExp(`^[^/]+/[A-Z]+-[0-9]+/[a-z-]+`, "i");
  const tagMatcherWithoutJira = new RegExp(`^[^/]+/[a-z-]+`, "i");
  const matchedWithJira = branchName.match(tagMatcherWithJira)
  const matchedWithoutJira = branchName.match(tagMatcherWithoutJira);
  if (!matchedWithJira && !matchedWithoutJira) return false
  

  let branchInfos
  if (matchedWithJira) {
    const matchedInfos = matchedWithJira[0].split('/')
    branchInfos = {
      commitType: branchTypeToCommitType[matchedInfos[0]].toLowerCase(),
      jiraTag: matchedInfos[1].toUpperCase()
    }
  } else if (matchedWithoutJira) {
    const matchedInfos = matchedWithoutJira[0].split('/')
    branchInfos = {
      commitType: branchTypeToCommitType[matchedInfos[0]].toLowerCase()
    }
  }
  
  return branchInfos
};

const commitMsgFile = process.env.GIT_PARAMS || process.env.HUSKY_GIT_PARAMS;
const commitMsg = fs.readFileSync(commitMsgFile, { encoding: "utf-8" });
const branchName = getBranchName();
const branchInfos = getBranchInfos(branchName);
const rawCommitMsgTitle = commitMsg.split("\n")[0];

if (branchInfos && branchInfos.commitType && isInvalidMessage(rawCommitMsgTitle)) {
    // Format the commit message / body
    const { jiraTag, commitType } = branchInfos
    console.log({ jiraTag, commitType })
    const messageLines = commitMsg.split("\n");
    const commitTitlePrefix = commitType + (jiraTag ? ` ${jiraTag}` : '')
    messageLines[0] = `${commitTitlePrefix}: ${rawCommitMsgTitle}`;
    fs.writeFileSync(commitMsgFile, messageLines.join("\n"), { encoding: "utf-8" });
} else {
    fs.writeFileSync(commitMsgFile, commitMsg, { encoding: "utf-8" });
}
