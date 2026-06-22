const Esp32 = require('./device');

/**
 * ESP32 Dev Module board manifest. Data only for now — it inherits the standard Arduino API from
 * the common-board layer. ESP32-specific blocks and codegen overrides would be added here.
 */
module.exports = {
    id: 'esp32',
    Device: Esp32
};
