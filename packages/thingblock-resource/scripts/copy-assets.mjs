// Copy raw pack assets that are not compiled JS — vendored `libs/` C++ sources and board icons — from
// each pack's source folder into its served dist folder, mirroring the path layout the Vite build
// produces (dist/thingblock-resource/extensions/<group>/<pack>/…). Run after `vite build`.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const EXTENSIONS_SRC = join('src', 'extensions')
const PACK_ROOT_OUT = join('dist', 'thingblock-resource', 'extensions')
const PACK_GROUPS = ['devices', 'peripheral']

for (const group of PACK_GROUPS) {
  const groupDir = join(EXTENSIONS_SRC, group)
  if (!existsSync(groupDir)) continue

  for (const pack of readdirSync(groupDir, { withFileTypes: true })) {
    if (!pack.isDirectory()) continue
    const packSrc = join(groupDir, pack.name)
    const packOut = join(PACK_ROOT_OUT, group, pack.name)
    mkdirSync(packOut, { recursive: true })

    // Vendored C++ library sources, resolved by the helper from its resource root at compile time.
    const libsDir = join(packSrc, 'libs')
    if (existsSync(libsDir)) cpSync(libsDir, join(packOut, 'libs'), { recursive: true })

    // Static assets (board icons).
    for (const entry of readdirSync(packSrc)) {
      if (entry.endsWith('.svg')) cpSync(join(packSrc, entry), join(packOut, entry))
    }
  }
}
