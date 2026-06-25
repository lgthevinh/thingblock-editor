/**
 * Servo peripheral codegen. One `forBlock` function reads the block's pin/angle and pushes the
 * cross-cutting fragments (the `<Servo.h>` include, one `Servo` object per pin, and its `attach()` in
 * `setup()`) into the generator's keyed buckets, so N servo blocks on the same pin collapse to one
 * object and one attach.
 */
import type { RegisterGenerators } from '../../../shared/types'

export const registerGenerators: RegisterGenerators = (generator, Order) => {
  generator.forBlock.servo_setangle = (block) => {
    const pin = generator.valueToCode(block, 'PIN', Order.ATOMIC) || '9'
    const angle = generator.valueToCode(block, 'ANGLE', Order.NONE) || '90'
    const name = `servo_${pin}`
    generator.includes.set('servo', '#include <Servo.h>')
    generator.globals.set(name, `Servo ${name};`)
    generator.setups.set(`${name}_attach`, `${name}.attach(${pin});`)
    return `${name}.write(${angle});\n`
  }
}
