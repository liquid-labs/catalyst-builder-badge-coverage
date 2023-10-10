import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import yaml from 'js-yaml'

import { getGitHubOrgAndProject } from '@liquid-labs/github-toolkit'
import { getPackageJSON } from '@liquid-labs/npm-toolkit'

const setupPassing = async({ cwd, myName, myVersion, passingBadges, requirePassingBadges }) => {
  const passingRegExes = passingBadges.map((b) => new RegExp(b, 'i'))

  let badgeLine = ''

  const workflowsPath = fsPath.join(cwd, '.github', 'workflows')
  if (!existsSync(workflowsPath)) {
    return {}
  }

  const packageJSON = await getPackageJSON({ pkgDir : cwd })
  const { org, project } = getGitHubOrgAndProject({ packageJSON })

  try {
    const workflows = await fs.readdir(workflowsPath)
    for (const passingRegEx of passingRegExes) {
      const workflow = workflows.find((wf) => wf.match(passingRegEx) !== null)
      if (requirePassingBadges === true && workflow === undefined) {
        throw new Error(`Did not find matching workflow for '${passingRegEx.toString()}'.`)
      }
      else if (workflow !== undefined) {
        const workflowPath = fsPath.join(workflowsPath, workflow)
        const workflowContents = await fs.readFile(workflowPath, { encoding : 'utf8' })
        const workflowData = yaml.load(workflowContents)
        const { name } = workflowData

        badgeLine += `[![${name}](https://github.com/${org}/${project}/actions/workflows/${workflow}/badge.svg)](https://github.com/${org}/${project}/actions/workflows/${workflow})`
      }
    }
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }
    else if (requirePassingBadges === true) {
      throw new Error('Did not find workflows to create passing badges at: ' + workflowsPath, { cause : e })
    }
    // else, taht's fine there's just nothing to do
  }

  return { badgeLine }
}

export { setupPassing }
