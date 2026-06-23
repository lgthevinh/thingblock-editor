const ArduinoNano = require('./device');
const iconURL = require('./assets/icon.svg');

/**
 * Arduino Nano board manifest. Data only — it inherits the standard Arduino API blocks and codegen
 * from the common-board layer, so it needs no Extension or codegen of its own.
 */
module.exports = {
    id: 'arduinoNano',
    iconURL,
    Device: ArduinoNano
};
