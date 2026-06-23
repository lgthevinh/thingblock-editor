const Esp32C3 = require('./device');
const iconURL = require('./assets/icon.svg');

/**
 * ESP32-C3 Dev Module board manifest. Data only — it inherits the standard Arduino API from the
 * common-board layer. ESP32-C3-specific blocks and codegen overrides would be added here.
 */
module.exports = {
    id: 'esp32c3',
    iconURL,
    Device: Esp32C3
};
