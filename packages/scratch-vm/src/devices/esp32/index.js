const Device = require('../device');

/**
 * ESP32 Dev Module device. ESP32-specific build options (PartitionScheme, FlashMode, and on
 * native-USB variants CDCOnBoot) go in the compile options when a device needs them; the plain
 * Dev Module builds with core defaults.
 */
class Esp32 extends Device {
    get deviceId () {
        return 'esp32';
    }

    get fqbn () {
        return 'esp32:esp32:esp32';
    }

    getCompileConfig () {
        return {options: {}};
    }

    getUploadConfig () {
        return {
            pnpid: [
                'USB\\VID_10C4&PID_EA60',
                'USB\\VID_1A86&PID_7523'
            ],
            uploadSpeed: 921600
        };
    }
}

module.exports = Esp32;
