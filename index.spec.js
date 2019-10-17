const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const proxyquire = require( 'proxyquire' ).noCallThru().noPreserveCache()

const processExitStub = sinon.stub(process, 'exit')
const consoleErrorStub = sinon.stub(console, 'error')

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

describe('index.js', () => {
  it('should add a type prefix', () => {
    validCommitTypes.forEach(type => {
      expect(executeScriptMock(`${type}/my-awesome-branch`, "My awesome commit message ✨")).to.equal(`${type}: My awesome commit message ✨`)
    })
  })
  
  it('should not add a prefix in merge pull requests', () => {
    const commitMergeMessage = "Merge branch 'dev' of github.com:bricoprive/bp-smart-commit into bugfixes"
    expect(executeScriptMock("feat/my-awesome-branch", commitMergeMessage)).to.equal(commitMergeMessage)
  })
  
  it('should return an error if branch name is invalid', () => {
    expect(executeScriptMock("invalid-branch-name", "My awesome commit message ✨")).to.equal(`My awesome commit message ✨`)
    expect(processExitStub.args[0][0]).to.equal(1)
    expect(consoleErrorStub.args[0][0]).to.equal('The branch name "invalid-branch-name" is invalid ! Please rename it using: git branch -m {type}/{optional-context}/short-description')
    expect(consoleErrorStub.args[1][0]).to.equal('Valid types are: feat, improvement, fix, docs, perf, build, ci, refactor, style, test, chore.')
    expect(consoleErrorStub.args[2][0]).to.equal('See https://www.conventionalcommits.org/en/v1.0.0/ for more informations.')
  })
})

/**
*
* @param {string} jiraProjectPrefix
* @param {string} gitBranchName The branch name
* @param {string} commitMessage
* @returns {string}
*/
const executeScriptMock = (gitBranchName, commitMessage) => {
  process.argv = ["node", "index.js"]
  const readFileSync = sinon.stub().returns(commitMessage)
  const writeFileSync = sinon.stub()
  
  // Mock the script dependencies
  proxyquire('./index.js', {
    fs: {
      readFileSync,
      writeFileSync
    },
    child_process: { execSync: () => gitBranchName },
    process: {
      exit: processExitStub
    },
    console: {
      error: consoleErrorStub
    }
  })
  
  // Return the prefixed commit message
  return writeFileSync.args[0][1]        
}