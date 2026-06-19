const Device = require('./device');
const DeviceRegistry = require('./device-registry');
const ArduinoUno = require('./arduino-uno');
const ArduinoNano = require('./arduino-nano');
const Esp32 = require('./esp32');

/**
 * Every device class. Constructing each with the runtime and registering it in a DeviceRegistry
 * (keyed by `deviceId`) is left to the wiring step that owns the runtime.
 */
const deviceClasses = [
    ArduinoUno,
    ArduinoNano,
    Esp32
];

module.exports = {
    Device,
    DeviceRegistry,
    deviceClasses
};
