import { describe, expect, it } from 'vitest'
import thingbotManifest from '../src/extensions/devices/thingbot/manifest'
import { registerBlocks } from '../src/extensions/peripheral/servo/blocks'
import { registerGenerators } from '../src/extensions/peripheral/servo/generator'
import servoManifest from '../src/extensions/peripheral/servo/manifest'
import servoToolbox from '../src/extensions/peripheral/servo/toolbox'
import { registerBlocks as registerThingbotBlocks } from '../src/extensions/peripheral/thingbot-core/blocks'
import { registerGenerators as registerThingbotGenerators } from '../src/extensions/peripheral/thingbot-core/generator'
import thingbotCoreManifest from '../src/extensions/peripheral/thingbot-core/manifest'
import thingbotToolbox from '../src/extensions/peripheral/thingbot-core/toolbox'
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

describe('thingbot-core peripheral', () => {
  it('defines thingbot_digitalwrite on the injected Blockly', () => {
    const Blocks: Record<string, unknown> = {}
    registerThingbotBlocks({ Blocks } as unknown as Blockly)
    expect(Blocks.thingbot_digitalwrite).toBeDefined()
  })

  it('emits pin setup and digital write code', () => {
    const gen = makeGenerator()
    registerThingbotGenerators(gen as unknown as ArduinoGenerator, Order)

    const code = gen.forBlock.thingbot_digitalwrite({
      values: { PIN: '5' },
      getFieldValue: () => 'LOW',
    })

    expect(code).toBe('digitalWrite(5, LOW);\n')
    expect(gen.setups.get('thingbot_pin_5_output')).toBe('pinMode(5, OUTPUT);')
  })

  it('falls back to pin 2 and HIGH when inputs are empty', () => {
    const gen = makeGenerator()
    registerThingbotGenerators(gen as unknown as ArduinoGenerator, Order)

    const code = gen.forBlock.thingbot_digitalwrite({
      values: {},
      getFieldValue: () => undefined,
    })

    expect(code).toBe('digitalWrite(2, HIGH);\n')
    expect(gen.setups.get('thingbot_pin_2_output')).toBe('pinMode(2, OUTPUT);')
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
    expect(thingbotManifest.extensions).toEqual(['thingbot-core', 'servo'])
    expect(thingbotManifest.compile?.options).toEqual({ CDCOnBoot: 'cdc' })
  })

  it('thingbot carries the device-card metadata the VM localizes and renders', () => {
    expect(thingbotManifest.description.id).toBe('device.thingbot.description')
    expect(thingbotManifest.description.default).toMatch(/ESP32-C3/)
    expect(thingbotManifest.manufacturer).toBe('ThingEdu')
    expect(thingbotManifest.requires).toBe('serial')
  })

  it('thingbot extension refs resolve to loaded peripheral packs', () => {
    const peripheralIds = new Set([thingbotCoreManifest.id, servoManifest.id])
    const refs = thingbotManifest.extensions ?? []
    expect(refs.length).toBeGreaterThan(0)
    for (const id of refs) {
      expect(peripheralIds).toContain(id)
    }
  })

  it('thingbot-core is a hidden peripheral pointing at its served modules', () => {
    expect(thingbotCoreManifest.kind).toBe('peripheral')
    expect(thingbotCoreManifest.id).toBe('thingbot-core')
    expect(thingbotCoreManifest.hidden).toBe(true)
    expect(thingbotCoreManifest.blocks).toBe('./blocks.js')
    expect(thingbotCoreManifest.generator).toBe('./generator.js')
  })

  it('thingbot toolbox references the device-exclusive block type', () => {
    expect(thingbotToolbox.contents).toContainEqual({ kind: 'block', type: 'thingbot_digitalwrite' })
  })
})
