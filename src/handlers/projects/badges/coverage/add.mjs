import { httpSmartResponse } from '@liquid-labs/http-smart-response'
import { commonParameters, processBadgeBuilders, updateReadme } from '@liquid-labs/sdlc-lib-badges'
import { gatherBasicBuilderData, processBuilderResults } from '@liquid-labs/sdlc-lib-build'

import { setupCoverage } from './lib/setup-coverage'

const help = {
  name        : 'Add test coverage badge',
  summary     : 'Adds a test coverage badge to the target package `README.md`.',
  description : "Generates a test coverage badge based on the `qa/coverage/clover.xml` coverage report. It will attempt to insert the badge image at the top of the package `README.md` just under the title line. The title line is determined by the first line beginning with a single '#'. If there is no `README.md` file, the function will attempt to generate based on the `package.json` settings."
}

const method = 'put'
const path = ['projects', 'badges', 'coverage', 'add']
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
