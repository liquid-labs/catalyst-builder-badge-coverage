import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import { makeBadge } from 'badge-maker'
import createError from 'http-errors'

import { httpSmartResponse } from '@liquid-labs/http-smart-response'

const help = {
  name        : 'Setup project badges',
  summary     : 'Sets up badges and inserts them into the README..',
  description : ``
}

const method = 'put'
const path = ['badges', 'setup']
const parameters = [
  {
    name    : 'noCoverage',
    isBoolean : true,
    summary : "Suppresses generation of the coverage badge."
  }
]

const func = ({ app, reporter }) => async(req, res) => {
  reporter.isolate()

  const cwd = req.get('X-CWD')
  if (cwd === undefined) {
    throw createError.BadRequest("Called 'badges setup', but working dir 'X-CWD' header not found.")
  }

  const cloverPath = fsPath.join(cwd, 'qa', 'coverage', 'clover.xml')
  const contents = await fs.readFile(cloverPath, { encoding: 'utf8' })

  const metricsLine = contents.match(/(<metrics [^>]+>)/m)[1]

  const statements = parseInt(metricsLine.match(/statements="(\d+)"/)[1])
  const coveredStatements = parseInt(metricsLine.match(/coveredstatements="(\d+)"/)[1])
  const conditionals = parseInt(metricsLine.match(/conditionals="(\d+)"/)[1])
  const coveredConditionals = parseInt(metricsLine.match(/coveredconditionals="(\d+)"/)[1])
  const methods = parseInt(metricsLine.match(/methods="(\d+)"/)[1])
  const coveredMethods = parseInt(metricsLine.match(/coveredmethods="(\d+)"/)[1])

  const coverage = ((coveredStatements/statements) + (coveredConditionals/conditionals) + (coveredMethods/methods))/3
  const coverageRounded = Math.round(coverage * 100)
  // anything less than 50% is red, then we make a gradient from 0 (red) to 1 (green)
  const colorshift = coverage <= .5 ? 1 : (coverage - 0.5) * 2

  // credit: https://stackoverflow.com/a/17268489/929494
  // const hue = ((1 - colorshift) * 120).toString(10)
  const hue = Math.round((1 - colorshift) * 120)
  console.log(hue)
  // const hslString = `hsl(${hue},100%,25%)`
  const hslString = `hsl(${hue},100%,35%)` // at 50%, it's hard to read the % number on the green field

  const badge = makeBadge({
    label: 'coverage',
    message: coverageRounded + '%',
    color: hslString,
    style: 'flat'
  })

  const readmeAssetsPath = fsPath.join(cwd, '.readme-assets')
  await fs.mkdir(readmeAssetsPath, { recursive: true })
  const coverageBadgePath = fsPath.join(readmeAssetsPath, 'coverage.svg')
  await fs.writeFile(coverageBadgePath, badge)

  const readmePath = fsPath.join(cwd, 'README.md')
  const readmeContents = await fs.readFile(readmePath, { encoding: 'utf8' })
  const readmeLines = readmeContents.split('\n')
  const tocIndex = readmeLines.findIndex((l) => l.match(/^# +.+/))

  const badgeLine = `[![coverage: ${coverageRounded}%](./.readme-assets/coverage.svg)](https://google.com)`

  readmeLines.splice(tocIndex + 1, 0, badgeLine)

  const newReadmeContents = readmeLines.join('\n')

  await fs.writeFile(readmePath, newReadmeContents)


  const msg = `Created ${1} badge.`

  httpSmartResponse({ msg, req, res })
}

export { help, func, method, parameters, path }
