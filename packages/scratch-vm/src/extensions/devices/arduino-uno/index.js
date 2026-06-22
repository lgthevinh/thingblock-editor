const ArduinoUno = require('./device');

/**
 * Arduino Uno board manifest. Data only — it inherits the standard Arduino API blocks and codegen
 * from the common-board layer, so it needs no Extension or codegen of its own.
 */
module.exports = {
    id: 'arduinoUno',
    Device: ArduinoUno
};
