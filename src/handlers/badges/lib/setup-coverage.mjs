import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import { makeBadge } from 'badge-maker'

const setupCoverage = async({ cwd, myName, myVersion }) => {
  const cloverPath = fsPath.join(cwd, 'qa', 'coverage', 'clover.xml')
  const contents = await fs.readFile(cloverPath, { encoding : 'utf8' })

  const metricsLine = contents.match(/(<metrics [^>]+>)/m)[1]

  const statements = parseInt(metricsLine.match(/statements="(\d+)"/)[1])
  const coveredStatements = parseInt(metricsLine.match(/coveredstatements="(\d+)"/)[1])
  const conditionals = parseInt(metricsLine.match(/conditionals="(\d+)"/)[1])
  const coveredConditionals = parseInt(metricsLine.match(/coveredconditionals="(\d+)"/)[1])
  const methods = parseInt(metricsLine.match(/methods="(\d+)"/)[1])
  const coveredMethods = parseInt(metricsLine.match(/coveredmethods="(\d+)"/)[1])

  const coverage = ((coveredStatements / statements) + (coveredConditionals / conditionals) + (coveredMethods / methods)) / 3
  const coverageRounded = Math.round(coverage * 100)
  // anything less than 50% is red, then we make a gradient from 0 (red) to 1 (green)
  const colorshift = coverage <= 0.5 ? 1 : (coverage - 0.5) * 2

  // credit: https://stackoverflow.com/a/17268489/929494
  const hue = Math.round((1 - colorshift) * 120)
  const hslString = `hsl(${hue},100%,35%)` // at 50%, it's hard to read the % number on the green field

  const badge = makeBadge({
    label   : 'coverage',
    message : coverageRounded + '%',
    color   : hslString,
    style   : 'flat'
  })

  const readmeAssetsPath = fsPath.join(cwd, '.readme-assets')
  await fs.mkdir(readmeAssetsPath, { recursive : true })
  const coverageBadgePath = fsPath.join(readmeAssetsPath, 'coverage.svg')
  await fs.writeFile(coverageBadgePath, badge)

  const badgeLine = `[![coverage: ${coverageRounded}%](./.readme-assets/coverage.svg)](https://google.com)`

  return {
    badgeLine,
    scripts : [
      {
        builder  : myName,
        version  : myVersion,
        priority : -1,
        path     : coverageBadgePath,
        purpose  : 'Test coverage badge for README.md.'
      }
    ]
  }
}

export { setupCoverage }
