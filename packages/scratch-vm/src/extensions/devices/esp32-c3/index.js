const Esp32C3 = require('./device');

/**
 * ESP32-C3 Dev Module board manifest. Data only — it inherits the standard Arduino API from the
 * common-board layer. ESP32-C3-specific blocks and codegen overrides would be added here.
 */
module.exports = {
    id: 'esp32c3',
    Device: Esp32C3
};
