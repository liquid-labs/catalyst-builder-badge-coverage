/* global beforeAll describe expect test */
import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import { updateReadme } from '../update-readme'

describe('updateReadme', () => {
  const pkgPath = fsPath.join(__dirname, 'data', 'pkgA')
  const readmePath = fsPath.join(pkgPath, 'README.md')
  const badgesLine = '[![some badge](./somelink)](./anotherLink)'

  beforeAll(async() => {
    await updateReadme({ workingPkgRoot : pkgPath, badgesLine })
  })

  test('inserts the badge line if not present', async() => {
    const afterContents = await fs.readFile(readmePath, { encoding : 'utf8' })
    const afterLines = afterContents.split('\n')
    expect(afterLines[1]).toBe(badgesLine)
  })

  test('replaces the badge line if present', async() => {
    const newBadgeLine = '[![new badge](./somelink)](./anotherLink)'
    await updateReadme({ workingPkgRoot : pkgPath, badgesLine : newBadgeLine })
    const afterContents = await fs.readFile(readmePath, { encoding : 'utf8' })
    const afterLines = afterContents.split('\n')
    expect(afterLines[1]).toBe(newBadgeLine)
  })
})
