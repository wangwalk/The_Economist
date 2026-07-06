import { readdir, writeFile } from 'node:fs/promises'

const owner = 'wangwalk'
const repo = 'The_Economist'
const branch = 'main'

const entries = await readdir('.', { withFileTypes: true })
const issues = entries
  .filter((entry) => entry.isDirectory() && /^TE-\d{4}-\d{2}-\d{2}$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => b.localeCompare(a, 'en'))

const years = new Map()

for (const issue of issues) {
  const year = issue.slice(3, 7)
  const fileName = `${issue}.epub`
  const path = `${issue}/${fileName}`
  const rawUrl = `https://github.com/${owner}/${repo}/raw/${branch}/${path}`

  if (!years.has(year)) {
    years.set(year, [])
  }

  years.get(year).push({ fileName, issue, rawUrl })
}

const total = Array.from(years.values()).reduce((sum, files) => sum + files.length, 0)
const lines = [
  '# EPUB Download Index',
  '',
  `This page lists ${total} EPUB files in this fork. Open a link on iPhone, download it in Safari, then share the file to WeChat Reading.`,
  '',
  '> Links point to GitHub raw downloads. They are public while this repository is public.',
  '',
]

for (const [year, files] of years) {
  lines.push(`## ${year}`, '')

  for (const file of files) {
    lines.push(`- [${file.fileName}](${file.rawUrl})`)
  }

  lines.push('')
}

await writeFile('EPUB_INDEX.md', `${lines.join('\n').trimEnd()}\n`, 'utf8')
