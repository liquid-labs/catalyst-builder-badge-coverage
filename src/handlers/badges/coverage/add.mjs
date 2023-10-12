import { commonParameters, processBadgeBuilders, updateReadme } from '@liquid-labs/catalyst-lib-badges'
import { gatherBasicBuilderData, processBuilderResults } from '@liquid-labs/catalyst-lib-build'
import { httpSmartResponse } from '@liquid-labs/http-smart-response'

import { setupCoverage } from './lib/setup-coverage'

const help = {
  name        : 'Add test coverage badge',
  summary     : 'Adds a test coverage badge to the target package README.md.',
  description : ''
}

const method = 'put'
const path = ['badges', 'coverage', 'add']
const parameters = commonParameters()

const func = ({ app, reporter }) => async(req, res) => {
  reporter.isolate()

  const { priority = 0 } = req.vars

  const { builderName: myName, builderVersion: myVersion, workingPkgRoot } =
    await gatherBasicBuilderData({ builderPkgDir : __dirname, req })

  const builders = [setupCoverage({ config : req.vars, myName, myVersion, priority, workingPkgRoot })]

  const results = await processBadgeBuilders({ builders })

  await processBuilderResults({ app, path, pkgRoot : workingPkgRoot, reporter, results, ...req.vars })

  await updateReadme({ pkgRoot : workingPkgRoot })

  const msg = 'Added coverage badge.'

  httpSmartResponse({ msg, data : results, req, res })
}

export { help, func, method, parameters, path }
