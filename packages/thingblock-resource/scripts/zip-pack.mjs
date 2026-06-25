// Zip the built resource pack for distribution. Produces dist/thingblock-resource_v<major>.<minor>.zip
// with the served `thingblock-resource/…` folder at the archive root, so unzipping into a helper's
// resource root yields the same layout the editor imports. Run after copy-assets.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative } from 'node:path'

const require = createRequire(import.meta.url)
const JSZip = require('jszip')

const PACK_ROOT = 'thingblock-resource'
const DIST = 'dist'
const packDir = join(DIST, PACK_ROOT)

// Version the archive name by major.minor (e.g. thingblock-resource_v0.1).
const { version } = require('../package.json')
const [major, minor] = version.split('.')
const zipName = `${PACK_ROOT}_v${major}.${minor}.zip`

/**
 * Add every file under `dir` to the zip, keyed by its path relative to `dist` so the archive root holds
 * the `thingblock-resource/` folder.
 * @param {import('jszip')} zip The archive being built.
 * @param {string} dir The directory to walk.
 */
function addDir(zip, dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) addDir(zip, full)
    else zip.file(relative(DIST, full), readFileSync(full))
  }
}

const zip = new JSZip()
addDir(zip, packDir)

const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
writeFileSync(join(DIST, zipName), buffer)
console.log(`Wrote ${join(DIST, zipName)}`)
