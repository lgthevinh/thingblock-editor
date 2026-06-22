const arduinoUno = require('./arduino-uno');
const arduinoNano = require('./arduino-nano');
const esp32 = require('./esp32');

/**
 * Every board manifest. Each entry is `{ id, Device, Extension?, getCodeGenerators? }`; boards that
 * inherit everything from the common-board layer carry only `Device` data. `deviceClasses` is the
 * flat list the runtime constructs and registers in the DeviceRegistry.
 */
const boards = [
    arduinoUno,
    arduinoNano,
    esp32
];

module.exports = {
    boards,
    deviceClasses: boards.map(board => board.Device)
};
