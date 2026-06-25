/**
 * Servo peripheral manifest. The Servo library source is vendored under `libs/`, so it is declared as a
 * vendored lib the helper resolves from its resource root at compile time — not a registry lib it would
 * install via arduino-cli.
 */
import type { PeripheralManifest } from '../../../shared/types'

const manifest: PeripheralManifest = {
  id: 'servo',
  kind: 'peripheral',
  name: 'Servo',
  blocks: './blocks.js',
  generator: './generator.js',
  toolbox: './toolbox.js',
  libs: [{ path: 'libs/Servo' }],
}

export default manifest
