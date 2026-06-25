import { describe, expect, it } from 'vitest'
import thingbotManifest from '../src/extensions/devices/thingbot/manifest'
import { registerBlocks } from '../src/extensions/peripheral/servo/blocks'
import { registerGenerators } from '../src/extensions/peripheral/servo/generator'
import servoManifest from '../src/extensions/peripheral/servo/manifest'
import servoToolbox from '../src/extensions/peripheral/servo/toolbox'
import type { ArduinoGenerator, ArduinoOrder, Blockly } from '../src/shared/types'

// Minimal stand-ins for the editor's injected instances: the order enum the pack reads and a generator
// whose buckets we can inspect. valueToCode returns the fake block's per-input source.
const Order = { ATOMIC: 0, NONE: 99 } as unknown as ArduinoOrder

const makeGenerator = () => ({
  forBlock: {} as Record<string, (block: unknown) => string | [string, number]>,
  includes: new Map<string, string>(),
  globals: new Map<string, string>(),
  setups: new Map<string, string>(),
  valueToCode: (block: { values: Record<string, string> }, name: string) => block.values[name] ?? '',
})

describe('servo generator', () => {
  it('emits the include, one Servo object, its attach, and the write call', () => {
    const gen = makeGenerator()
    registerGenerators(gen as unknown as ArduinoGenerator, Order)

    const code = gen.forBlock.servo_setangle({ values: { PIN: '9', ANGLE: '90' } })

    expect(code).toBe('servo_9.write(90);\n')
    expect(gen.includes.get('servo')).toBe('#include <Servo.h>')
    expect(gen.globals.get('servo_9')).toBe('Servo servo_9;')
    expect(gen.setups.get('servo_9_attach')).toBe('servo_9.attach(9);')
  })

  it('falls back to default pin and angle when inputs are empty', () => {
    const gen = makeGenerator()
    registerGenerators(gen as unknown as ArduinoGenerator, Order)

    const code = gen.forBlock.servo_setangle({ values: {} })

    expect(code).toBe('servo_9.write(90);\n')
    expect(gen.globals.get('servo_9')).toBe('Servo servo_9;')
  })
})

describe('servo blocks', () => {
  it('defines servo_setangle on the injected Blockly', () => {
    const Blocks: Record<string, unknown> = {}
    registerBlocks({ Blocks } as unknown as Blockly)
    expect(Blocks.servo_setangle).toBeDefined()
  })
})

describe('manifests', () => {
  it('servo is a peripheral pointing at its served modules', () => {
    expect(servoManifest.kind).toBe('peripheral')
    expect(servoManifest.id).toBe('servo')
    expect(servoManifest.blocks).toBe('./blocks.js')
    expect(servoManifest.generator).toBe('./generator.js')
    expect(servoManifest.libs).toEqual([{ path: 'libs/Servo' }])
  })

  it('servo toolbox references the block type', () => {
    expect(servoToolbox.contents).toContainEqual({ kind: 'block', type: 'servo_setangle' })
  })

  it('thingbot is an esp32-c3 device with USB-CDC compile config', () => {
    expect(thingbotManifest.kind).toBe('device')
    expect(thingbotManifest.id).toBe('thingbot')
    expect(thingbotManifest.fqbn).toBe('esp32:esp32:esp32c3')
    expect(thingbotManifest.compile?.options).toEqual({ CDCOnBoot: 'cdc' })
  })
})
