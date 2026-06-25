/**
 * The contract a resource pack implements. These types are authored against `@scratch/scratch-blocks`
 * for build-time checking only; at runtime the editor injects its live Blockly and `arduinoGenerator`
 * instances, and the pack registers against them. Nothing here is bundled into the served output.
 */
import type * as ScratchBlocks from '@scratch/scratch-blocks'

/** The injected Blockly/scratch-blocks module (the editor's live instance). */
export type Blockly = typeof ScratchBlocks

/** The injected Arduino code generator (the editor's shared `arduinoGenerator` singleton). */
export type ArduinoGenerator = ScratchBlocks.ArduinoGenerator

/** The injected Arduino operator-precedence enum (`Order`), passed in because a served pack cannot import it. */
export type ArduinoOrder = typeof ScratchBlocks.ArduinoOrder

/** A pack's `blocks.js` export: define the pack's palette/block shapes on the injected Blockly. */
export type RegisterBlocks = (blockly: Blockly) => void

/** A pack's `generator.js` export: register `forBlock` codegen and cross-cutting fragments. */
export type RegisterGenerators = (generator: ArduinoGenerator, order: ArduinoOrder) => void

/** A published Arduino library installed by the helper via `arduino-cli lib install`; never vendored. */
export interface RegistryLib {
  name: string
  version: string
}

/** A vendored library under the pack's `libs/` (a path to the library directory or a single source file), resolved from the helper's resource root at compile time. */
export interface LibFile {
  path: string
}

/** Fields shared by every pack manifest. */
interface BaseManifest {
  /** Logical id (e.g. `servo`, `arduinoUno`); the served path is the pack folder name. */
  id: string
  /** Human-readable name. */
  name: string
}

/** A peripheral pack: blocks + codegen + toolbox for a component wired to any board. */
export interface PeripheralManifest extends BaseManifest {
  kind: 'peripheral'
  /** Relative path to the `registerBlocks` module. */
  blocks: string
  /** Relative path to the `registerGenerators` module. */
  generator: string
  /** Relative path to the toolbox-category module. */
  toolbox: string
  /** Published libraries the helper installs via arduino-cli. */
  registryLibs?: RegistryLib[]
  /** Vendored `libs/` sources the helper resolves from its resource root. */
  libs?: LibFile[]
}

/** A device pack: board selection data only; blocks/codegen are inherited from the common-board layer. */
export interface DeviceManifest extends BaseManifest {
  kind: 'device'
  /** Fully-qualified board name for arduino-cli (e.g. `arduino:avr:uno`). */
  fqbn: string
  /** Relative path to the board icon. */
  icon: string
  /** arduino-cli compile options. */
  compile?: { options?: Record<string, string> }
  /** Upload/flash configuration. */
  upload?: {
    pnpid?: string[]
    uploadSpeed?: number
  }
}

export type PackManifest = PeripheralManifest | DeviceManifest

/** A Blockly toolbox category referencing a pack's block types. */
export interface ToolboxCategory {
  kind: 'category'
  name: string
  colour?: string
  contents: { kind: 'block'; type: string }[]
}
