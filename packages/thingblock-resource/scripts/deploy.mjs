// Deploy the built resource pack into the local helper's resource root, where `thingblock-link` serves
// it as static files and resolves vendored `libs/` sources at compile time. The resource root is the
// helper app's own directory (single version) — see thingblock-link's resource-serving design — so it
// is passed in rather than hard-coded. Lands the served `thingblock-resource/` folder under the root.
//
//   THINGBLOCK_RESOURCE_ROOT=/path/to/helper/resources npm run deploy
import { cpSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const PACK_ROOT = 'thingblock-resource'

const dest = process.env.THINGBLOCK_RESOURCE_ROOT
if (!dest) {
  console.error('THINGBLOCK_RESOURCE_ROOT is not set; point it at the helper resource root.')
  process.exit(1)
}

const pack = resolve('dist', PACK_ROOT)
if (!existsSync(pack)) {
  console.error(`dist/${PACK_ROOT} not found; run \`npm run build\` first.`)
  process.exit(1)
}

const target = join(resolve(dest), PACK_ROOT)
cpSync(pack, target, { recursive: true })
console.log(`Deployed resource pack to ${target}`)
