#!/usr/bin/env tsx
/**
 * Prints a direct-vs-transitive dependency summary per workspace member, plus any
 * package that is pinned in more than one place with a different range.
 *
 * Reads pnpm-lock.yaml only — no network, no install required.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface ImporterSpec {
  specifier: string
  version: string
}

interface Importer {
  dependencies?: Record<string, ImporterSpec>
  devDependencies?: Record<string, ImporterSpec>
}

const ROOT = join(import.meta.dirname, '..')

function parseLock(): { importers: Record<string, Importer>; packages: Record<string, unknown> } {
  const raw = readFileSync(join(ROOT, 'pnpm-lock.yaml'), 'utf8')
  // Deliberately naive: we only need the importers block and the package keys,
  // and adding a YAML parser to devDependencies for one script is not worth it.
  const importers: Record<string, Importer> = {}
  const packages: Record<string, unknown> = {}

  let section: 'importers' | 'packages' | 'snapshots' | undefined
  let importer: string | undefined
  let bucket: 'dependencies' | 'devDependencies' | undefined
  let pending: string | undefined

  for (const line of raw.split('\n')) {
    if (/^importers:/.test(line)) { section = 'importers'; continue }
    if (/^packages:/.test(line)) { section = 'packages'; continue }
    if (/^snapshots:/.test(line)) { section = 'snapshots'; continue }

    if (section === 'packages') {
      const match = /^ {2}'?([^':]+@[^':]+)'?:/.exec(line)
      if (match) packages[match[1]!] = true
      continue
    }

    if (section !== 'importers') continue

    const importerMatch = /^ {2}([^ ].*):$/.exec(line)
    if (importerMatch) {
      importer = importerMatch[1]!.replace(/:$/, '')
      importers[importer] = {}
      bucket = undefined
      continue
    }

    const bucketMatch = /^ {4}(dependencies|devDependencies):$/.exec(line)
    if (bucketMatch && importer) {
      bucket = bucketMatch[1] as 'dependencies' | 'devDependencies'
      importers[importer]![bucket] = {}
      continue
    }

    const nameMatch = /^ {6}'?([^':]+)'?:$/.exec(line)
    if (nameMatch) { pending = nameMatch[1]!; continue }

    const specMatch = /^ {8}specifier: (.+)$/.exec(line)
    if (specMatch && importer && bucket && pending) {
      importers[importer]![bucket]![pending] = { specifier: specMatch[1]!.trim(), version: '' }
    }
  }

  return { importers, packages }
}

const { importers, packages } = parseLock()

console.log('Workspace dependency summary\n')

const rangesByPackage = new Map<string, Set<string>>()

for (const [name, importer] of Object.entries(importers)) {
  const direct = Object.keys(importer.dependencies ?? {}).length
  const dev = Object.keys(importer.devDependencies ?? {}).length
  console.log(`  ${name.padEnd(28)} ${String(direct).padStart(3)} deps  ${String(dev).padStart(3)} devDeps`)

  for (const bucket of [importer.dependencies, importer.devDependencies]) {
    for (const [pkg, spec] of Object.entries(bucket ?? {})) {
      if (!rangesByPackage.has(pkg)) rangesByPackage.set(pkg, new Set())
      rangesByPackage.get(pkg)!.add(spec.specifier)
    }
  }
}

console.log(`\n  resolved packages in lockfile: ${Object.keys(packages).length}`)

const divergent = [...rangesByPackage.entries()].filter(([, ranges]) => ranges.size > 1)
if (divergent.length > 0) {
  console.log('\nPackages pinned to different ranges across workspaces:\n')
  for (const [pkg, ranges] of divergent) {
    console.log(`  ${pkg}: ${[...ranges].join(', ')}`)
  }
}

const nextEcosystem = [...rangesByPackage.entries()].filter(
  ([pkg]) => pkg === 'next' || pkg.startsWith('@next/') || pkg === 'eslint-config-next'
)
console.log('\nNext.js ecosystem pins (these must move together):\n')
for (const [pkg, ranges] of nextEcosystem) {
  console.log(`  ${pkg.padEnd(24)} ${[...ranges].join(', ')}`)
}
