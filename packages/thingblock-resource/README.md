# @thingblock/thingblock-resource

ThingEdu's **Scratch-plane resource pack**: device manifests, peripheral block definitions, Arduino
codegen, toolbox categories, and vendored C++ library sources, authored as one versioned package and
built to **dynamically-importable ESM**. The local helper (`thingblock-link`) serves the built packs as
static files; the editor `import()`s them at runtime and registers each pack's codegen against the
editor's shared `arduinoGenerator` singleton.

Design context: `scratch-editor/.agents/docs/25-06_01.blockly-arduino-codegen.md` (the codegen
contract this pack registers against) and `25-06_02.resource-distribution.md` (the distribution model:
helper serves packs, editor imports them).

## The one rule: inject, never bundle

Pack modules bind to the editor's **live** Blockly and `arduinoGenerator` by injection, so the build
externalizes `blockly` and `@scratch/scratch-blocks` (they are build/type-time only). A pack that
bundled its own copy would get a different singleton and its registrations would be invisible.

```text
// blocks.js
export const registerBlocks = (Blockly) => { Blockly.Blocks.servo_setangle = { init() { ... } } }
// generator.js
export const registerGenerators = (generator, Order) => { generator.forBlock.servo_setangle = ... }
```

## Layout

Source mirrors scratch-vm's `extensions/<group>/<pack>` layout:

```
src/
  shared/types.ts                       the pack contract (manifest + register* signatures)
  extensions/
    peripheral/servo/                   worked peripheral: manifest, blocks, generator, toolbox, libs/
    devices/thingbot/                   worked device: ESP32-C3 variant manifest + icon
```

The build wraps everything under one served root that preserves that layout:

```
dist/thingblock-resource/extensions/
  peripheral/servo/{manifest,blocks,generator,toolbox}.js + libs/Servo/…
  devices/thingbot/manifest.js + icon.svg
```

Modules compile to ESM; `libs/` and icons are copied verbatim. The served path is
`/resources/thingblock-resource/extensions/<group>/<pack>/…`. The build also writes a versioned archive
of the pack, `dist/thingblock-resource_v<major>.<minor>.zip` (e.g. `thingblock-resource_v0.1.zip`), for
distribution to the helper.

## Commands

```sh
npm run build --workspace=packages/thingblock-resource     # typecheck + Vite build + copy assets + zip
npm test  --workspace=packages/thingblock-resource          # lint + Vitest
THINGBLOCK_RESOURCE_ROOT=<helper-resource-dir> \
  npm run deploy --workspace=packages/thingblock-resource    # copy the pack folder into the helper
```

## Adding a pack

1. Create `src/extensions/peripheral/<id>/` (or `src/extensions/devices/<id>/`) with a `manifest.ts`.
2. For a peripheral, add `blocks.ts`, `generator.ts`, `toolbox.ts`, and any vendored `libs/` sources.
   For a device, add the board `icon.svg`.
3. The build discovers it automatically (no entry list to maintain).

> Two libs categories: published Arduino libraries go in `registryLibs` (the helper installs them via
> arduino-cli); un-published, extension-vendored source goes under `libs/` and is referenced by
> `libs:[{path}]` (as the bundled Servo peripheral does).
