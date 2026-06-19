const {
    Language,
    arg,
    expression,
    line,
    statement
} = require('../../codegen/code-generator-provider');

const EXTENSION_ID = 'arduino';
const PREFIX = `${EXTENSION_ID}_`;

// Board-only blocks: register arduino-cpp generators only. In host (js) mode these blocks
// are hidden from the palette, and codegen intentionally reports them as unsupported.
const command = (opcode, cppCode) => ([{
    opcode: `${PREFIX}${opcode}`,
    language: Language.ARDUINO_CPP,
    generator: statement((ctx, block, indentLevel) => line(ctx, indentLevel, `${cppCode(ctx, block)};`))
}]);

const reporter = (opcode, cppCode) => ([{
    opcode: `${PREFIX}${opcode}`,
    language: Language.ARDUINO_CPP,
    generator: expression(cppCode)
}]);

// Pin mode and digital level menu values are C++ identifiers (OUTPUT, HIGH, ...), so they are
// emitted unquoted via `arg`, which reads the connected input or falls back to the field value.
const getCodeGenerators = () => ([
    ...command(
        'pinMode',
        (ctx, block) => `pinMode(${arg(ctx, block, 'PIN', '13')}, ${arg(ctx, block, 'MODE', 'OUTPUT')})`
    ),
    ...command(
        'digitalWrite',
        (ctx, block) => `digitalWrite(${arg(ctx, block, 'PIN', '13')}, ${arg(ctx, block, 'LEVEL', 'HIGH')})`
    ),
    ...reporter(
        'digitalRead',
        (ctx, block) => `digitalRead(${arg(ctx, block, 'PIN', '2')})`
    ),
    ...command(
        'analogWrite',
        (ctx, block) => `analogWrite(${arg(ctx, block, 'PIN', '9')}, ${arg(ctx, block, 'VALUE', '128')})`
    ),
    ...reporter(
        'analogRead',
        (ctx, block) => `analogRead(${arg(ctx, block, 'PIN', '0')})`
    ),
    ...command(
        'delay',
        (ctx, block) => `delay(${arg(ctx, block, 'MS', '1000')})`
    )
]);

module.exports = {
    getCodeGenerators
};
