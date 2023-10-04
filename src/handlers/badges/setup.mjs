import createError from 'http-errors'

import { getPackageNameAndVersion } from '@liquid-labs/catalyst-lib-build'
import { httpSmartResponse } from '@liquid-labs/http-smart-response'

import { setupCoverage } from './lib/setup-coverage'
import { updateReadme } from './lib/update-readme'

const help = {
  name        : 'Setup project badges',
  summary     : 'Sets up badges and inserts them into the README..',
  description : ''
}

const method = 'put'
const path = ['badges', 'setup']
const parameters = [
  {
    name      : 'noCoverage',
    isBoolean : true,
    summary   : 'Suppresses generation of the coverage badge.'
  }
]

const func = ({ app, reporter }) => async(req, res) => {
  reporter.isolate()

  const cwd = req.get('X-CWD')
  if (cwd === undefined) {
    throw createError.BadRequest("Called 'badges setup', but working dir 'X-CWD' header not found.")
  }

  const [myName, myVersion] = await getPackageNameAndVersion({ pkgDir : __dirname })

  const builders = [
    setupCoverage({ cwd, myName, myVersion })
  ]

  const results = await Promise.all(builders)

  const badgeLines = []
  const dependencyIndex = {}
  const scripts = []

  for (const result of results) {
    badgeLines.push(result.badgeLine)
    for (const dep of result.dependencies || []) {
      dependencyIndex[dep] = true
    }
    scripts.push(...(result.scripts || []))
  }

  const badgesLine = badgeLines.join(' ')
  const readmePromise = updateReadme({ cwd, badgesLine })

  const data = {
    dependencies : Object.keys(dependencyIndex).sort(),
    scripts      : scripts.sort((a, b) => {
      if (a.priority < b.priority) return -1
      else if (a.priority > b.priority) return 1
      else return 0
    })
  }

  const msg = `Created ${1} badge.`

  await readmePromise

  httpSmartResponse({ msg, data, req, res })
}

export { help, func, method, parameters, path }
