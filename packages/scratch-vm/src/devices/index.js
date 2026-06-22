const Device = require('./device');
const DeviceRegistry = require('./device-registry');

/**
 * The device framework: the `Device` base contract and the `DeviceRegistry`. Concrete boards live
 * under `extensions/devices/` and are aggregated there; constructing each with the runtime and
 * registering it is left to the wiring step that owns the runtime.
 */
module.exports = {
    Device,
    DeviceRegistry
};
