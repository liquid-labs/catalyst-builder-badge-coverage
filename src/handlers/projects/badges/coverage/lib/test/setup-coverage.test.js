/* global beforeAll describe expect test */
import { existsSync } from 'node:fs'
import * as fsPath from 'node:path'

import { setupCoverage } from '../setup-coverage'

describe('setupCoverage', () => {
  const myName = '@liquid-labs/sdlc-builder-badger'
  const myVersion = '1.0.1'
  const pkgPath = fsPath.join(__dirname, 'data', 'pkgA')

  beforeAll(async() => {
    await setupCoverage({ workingPkgRoot : pkgPath, myName, myVersion })
  })

  test('creates a badge file', () => {
    const badgePath = fsPath.join(pkgPath, '.readme-assets', 'coverage.svg')
    expect(existsSync(badgePath)).toBe(true)
  })
})
