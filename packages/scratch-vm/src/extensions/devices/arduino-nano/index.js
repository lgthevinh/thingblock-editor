const ArduinoNano = require('./device');

/**
 * Arduino Nano board manifest. Data only — it inherits the standard Arduino API blocks and codegen
 * from the common-board layer, so it needs no Extension or codegen of its own.
 */
module.exports = {
    id: 'arduinoNano',
    Device: ArduinoNano
};
