const Device = require('../device');

/**
 * Arduino Uno (ATmega328P) device.
 */
class ArduinoUno extends Device {
    get deviceId () {
        return 'arduinoUno';
    }

    get fqbn () {
        return 'arduino:avr:uno';
    }

    getCompileConfig () {
        return {options: {}};
    }

    getUploadConfig () {
        return {
            pnpid: [
                'USB\\VID_2341&PID_0043',
                'USB\\VID_2341&PID_0001'
            ],
            uploadSpeed: 115200
        };
    }
}

module.exports = ArduinoUno;
