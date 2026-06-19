const Device = require('../device');

/**
 * Arduino Nano (ATmega328P) device. Shares the ATmega328P FQBN family with the Uno but is a
 * distinct device: its classic bootloader needs the old-bootloader CPU option and a slower
 * upload speed, so it keys on its own `deviceId`.
 */
class ArduinoNano extends Device {
    get deviceId () {
        return 'arduinoNano';
    }

    get fqbn () {
        return 'arduino:avr:nano';
    }

    getCompileConfig () {
        return {options: {cpu: 'atmega328old'}};
    }

    getUploadConfig () {
        return {
            pnpid: [
                'USB\\VID_1A86&PID_7523',
                'USB\\VID_0403&PID_6001'
            ],
            uploadSpeed: 57600
        };
    }
}

module.exports = ArduinoNano;
