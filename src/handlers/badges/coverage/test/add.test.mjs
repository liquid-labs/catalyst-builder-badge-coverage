/* global beforeAll describe expect test */
import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

import * as addHandler from '../add'

const testPkgPath = fsPath.join(__dirname, 'data', 'pkgA')

const appMock = {
  ext : {
    devPaths : []
  }
}

const reporterMock = {
  isolate : () => {},
  log     : () => {},
  error   : () => {}
}

const reqMock = {
  accepts : () => 'application/json',
  get     : (header) => header === 'X-CWD' ? testPkgPath : undefined,
  vars    : {}
}

describe('PUT:badges/coverage/add', () => {
  let resultJSON
  beforeAll(async() => {
    const handler = addHandler.func({ app : appMock, reporter : reporterMock })
    let result = ''
    const mockRes = { write : (chunk) => { result += chunk }, end : () => {}, type : () => {} }
    await handler(reqMock, mockRes)
    resultJSON = JSON.parse(result)
  })

  test('updates the READEM.md', async() => {
    const readmePath = fsPath.join(testPkgPath, 'README.md')
    const readmeContents = await fs.readFile(readmePath, { encoding : 'utf8' })
    expect(readmeContents).toMatch(/\[!\[/m)
  })

  test('produces a result with one script', () => {
    expect(resultJSON.artifacts).toHaveLength(1)
  })
})
