#!/usr/bin/env node
/**
 * Preinstall guard.
 *
 * 1. Refuses to run under npm or yarn — the lockfile is pnpm-only and installing
 *    with another client silently produces a different tree.
 * 2. Refuses to run on a Node major we do not ship on.
 * 3. Warns when `pnpm.overrides` has been added to package.json, which pnpm 11
 *    ignores. Resolution overrides belong in pnpm-workspace.yaml.
 */

const fs = require('node:fs')
const path = require('node:path')

const REQUIRED_NODE_MAJOR = 24

function fail(message) {
  console.error(`\n[enforce-safe-chain] ${message}\n`)
  process.exit(1)
}

const userAgent = process.env.npm_config_user_agent ?? ''
if (userAgent && !userAgent.startsWith('pnpm')) {
  fail(`This workspace requires pnpm. Detected: ${userAgent.split(' ')[0]}`)
}

const major = Number(process.versions.node.split('.')[0])
if (major !== REQUIRED_NODE_MAJOR) {
  fail(`Node ${REQUIRED_NODE_MAJOR}.x is required (found ${process.versions.node}). Run \`nvm use\`.`)
}

const manifestPath = path.join(__dirname, '..', 'package.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

if (manifest.pnpm && Object.keys(manifest.pnpm).length > 0) {
  console.warn(
    '\n[enforce-safe-chain] WARNING: package.json has a "pnpm" key. pnpm 11 ignores it —\n' +
      '  move overrides / onlyBuiltDependencies into pnpm-workspace.yaml or they will not apply.\n'
  )
}

const workspacePath = path.join(__dirname, '..', 'pnpm-workspace.yaml')
if (!fs.existsSync(workspacePath)) {
  fail('pnpm-workspace.yaml is missing; resolution overrides would be lost.')
}
