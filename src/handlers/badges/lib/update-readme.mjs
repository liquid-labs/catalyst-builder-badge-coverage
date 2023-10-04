import * as fs from 'node:fs/promises'
import * as fsPath from 'node:path'

const badgeLineRe = /^\s*\[!\[/

const updateReadme = async({ cwd, badgesLine }) => {
  const readmePath = fsPath.join(cwd, 'README.md')
  const readmeContents = await fs.readFile(readmePath, { encoding : 'utf8' })
  const readmeLines = readmeContents.split('\n')
  const tocIndex = readmeLines.findIndex((l) => l.match(/^# +.+/))
  // note, if there is no TOC index, the rest works out because then we want to put the badges on the top line and
  // '-1 + 1 = 0'

  const spliceDelete = readmeLines[tocIndex + 1]?.match(badgeLineRe) ? 1 : 0

  readmeLines.splice(tocIndex + 1, spliceDelete, badgesLine)

  const newReadmeContents = readmeLines.join('\n')

  await fs.writeFile(readmePath, newReadmeContents)
}

export { updateReadme }
