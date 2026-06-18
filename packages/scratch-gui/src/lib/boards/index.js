const boardMap = {
    'arduino:avr:uno': {
        name: 'Arduino Uno',
        fqbn: 'arduino:avr:uno',
        mcu: 'atmega328p',
        baud: 115200,
        pins: {}
    },
    'arduino:avr:nano': {
        name: 'Arduino Nano',
        fqbn: 'arduino:avr:nano',
        mcu: 'atmega328p',
        baud: 115200,
        pins: {}
    },
    'esp32:esp32:esp32': {
        name: 'ESP32 Dev Module',
        fqbn: 'esp32:esp32:esp32',
        mcu: 'esp32',
        baud: 115200,
        pins: {}
    }
};

const boards = Object.entries(boardMap).map(([id, board]) => ({
    id,
    name: board.name
}));

const DEFAULT_BOARD_ID = 'arduino:avr:uno';

export {
    boards,
    boardMap,
    DEFAULT_BOARD_ID
};
