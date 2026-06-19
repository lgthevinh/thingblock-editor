/**
 * Holds the set of available devices, keyed by `deviceId`.
 *
 * Devices are constructed with the runtime by whoever owns wiring, then registered here.
 * Lookups by `deviceId` drive device selection and (later) the upload flow.
 */
class DeviceRegistry {
    constructor () {
        this._byDeviceId = new Map();
    }

    /**
     * @param {Device} device - a constructed device instance.
     * @returns {Device} the registered device.
     */
    register (device) {
        if (this._byDeviceId.has(device.deviceId)) {
            throw new Error(`DeviceRegistry: duplicate deviceId "${device.deviceId}"`);
        }
        this._byDeviceId.set(device.deviceId, device);
        return device;
    }

    /**
     * @param {string} deviceId - the device id to look up.
     * @returns {?Device} the device, or null if none is registered.
     */
    get (deviceId) {
        return this._byDeviceId.get(deviceId) || null;
    }

    /**
     * @returns {Array.<string>} the registered device ids.
     */
    get deviceIds () {
        return [...this._byDeviceId.keys()];
    }
}

module.exports = DeviceRegistry;
