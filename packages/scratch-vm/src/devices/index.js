const Device = require('./device');
const DeviceRegistry = require('./device-registry');
const PeripheralRegistry = require('./peripheral-registry');
const ManifestDevice = require('./manifest-device');

/**
 * The device framework: the `Device` base contract, the `DeviceRegistry`, `ManifestDevice` (the
 * data-driven device for helper-served resource packs), and the `PeripheralRegistry` (the peripheral
 * packs the active device activates — its own hidden pack plus reusable components). Concrete boards
 * live under `extensions/devices/` and are aggregated there; constructing each with the runtime and
 * registering it is left to the wiring step that owns the runtime.
 */
module.exports = {
    Device,
    DeviceRegistry,
    PeripheralRegistry,
    ManifestDevice
};
