const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');

// eslint-disable-next-line @stylistic/max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImhzbCgxNjMsIDg1JSwgNDAlKSIvPgogIDxnIHN0cm9rZT0id2hpdGUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CiAgICA8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcng9IjIiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTIpIi8+CiAgICA8cGF0aCBkPSJNIDE1LDEwIGEgNSw1IDAgMCwwIDEwLDAiIHN0cm9rZS13aWR0aD0iMS4yIi8+CiAgICA8bGluZSB4MT0iNiIgeTE9IjE1IiB4Mj0iMTAiIHkyPSIxNSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICAgIDxsaW5lIHgxPSI2IiB5MT0iMjAiIHgyPSIxMCIgeTI9IjIwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPGxpbmUgeDE9IjYiIHkxPSIyNSIgeDI9IjEwIiB5Mj0iMjUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8bGluZSB4MT0iMzAiIHkxPSIxNSIgeDI9IjM0IiB5Mj0iMTUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8bGluZSB4MT0iMzAiIHkxPSIyMCIgeDI9IjM0IiB5Mj0iMjAiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8bGluZSB4MT0iMzAiIHkxPSIyNSIgeDI9IjM0IiB5Mj0iMjUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICA8bGluZSB4MT0iMTYiIHkxPSI2IiB4Mj0iMTYiIHkyPSIxMCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICAgIDxsaW5lIHgxPSIyNCIgeTE9IjYiIHgyPSIyNCIgeTI9IjEwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPGxpbmUgeDE9IjE2IiB5MT0iMzAiIHgyPSIxNiIgeTI9IjM0IiBzdHJva2Utd2lkdGg9IjEuNSIvPgogICAgPGxpbmUgeDE9IjI0IiB5MT0iMzAiIHgyPSIyNCIgeTI9IjM0IiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDwvZz4KPC9zdmc+';

const PinMode = {
    INPUT: 'INPUT',
    OUTPUT: 'OUTPUT',
    INPUT_PULLUP: 'INPUT_PULLUP'
};

const DigitalLevel = {
    HIGH: 'HIGH',
    LOW: 'LOW'
};

class ThingBotTelemetrix {
    constructor (runtime) {
        this.runtime = runtime;
        this._pinValues = {};
    }

    getInfo () {
        return {
            id: 'thingbotTelemetrix',
            name: formatMessage({
                id: 'thingbotTelemetrix.name',
                default: 'ThingBot Telemetrix',
                description: 'Name of the ThingBot Telemetrix extension'
            }),
            blockIconURI,
            blocks: [
                {
                    opcode: 'setPinMode',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'thingbotTelemetrix.setPinMode',
                        default: 'set pin [PIN] mode [MODE]',
                        description: 'Set the mode of a digital pin'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 13
                        },
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'PIN_MODE',
                            defaultValue: PinMode.OUTPUT
                        }
                    }
                },
                {
                    opcode: 'digitalWrite',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'thingbotTelemetrix.digitalWrite',
                        default: 'digital write pin [PIN] [LEVEL]',
                        description: 'Write a digital HIGH or LOW value to a pin'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 13
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'DIGITAL_LEVEL',
                            defaultValue: DigitalLevel.HIGH
                        }
                    }
                },
                {
                    opcode: 'digitalRead',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'thingbotTelemetrix.digitalRead',
                        default: 'digital read pin [PIN]',
                        description: 'Read the digital value (0 or 1) from a pin'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'analogRead',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'thingbotTelemetrix.analogRead',
                        default: 'analog read pin [PIN]',
                        description: 'Read the analog value (0–1023) from a pin'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'pwmWrite',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'thingbotTelemetrix.pwmWrite',
                        default: 'PWM write pin [PIN] value [VALUE]',
                        description: 'Write a PWM value (0–255) to a pin'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 9
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 128
                        }
                    }
                },
                {
                    opcode: 'servoWrite',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'thingbotTelemetrix.servoWrite',
                        default: 'servo write pin [PIN] angle [ANGLE]',
                        description: 'Write a servo angle (0–180) to a pin'
                    }),
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 9
                        },
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                }
            ],
            menus: {
                PIN_MODE: {
                    acceptReporters: false,
                    items: [
                        {text: 'INPUT', value: PinMode.INPUT},
                        {text: 'OUTPUT', value: PinMode.OUTPUT},
                        {text: 'INPUT_PULLUP', value: PinMode.INPUT_PULLUP}
                    ]
                },
                DIGITAL_LEVEL: {
                    acceptReporters: false,
                    items: [
                        {text: 'HIGH', value: DigitalLevel.HIGH},
                        {text: 'LOW', value: DigitalLevel.LOW}
                    ]
                }
            }
        };
    }

    setPinMode ({PIN, MODE}) {
        // stub: wire up to serial transport when available
        return Promise.resolve();
    }

    digitalWrite ({PIN, LEVEL}) {
        // stub: wire up to serial transport when available
        return Promise.resolve();
    }

    digitalRead ({PIN}) {
        return this._pinValues[`d${PIN}`] || 0;
    }

    analogRead ({PIN}) {
        return this._pinValues[`a${PIN}`] || 0;
    }

    pwmWrite ({PIN, VALUE}) {
        const clamped = Math.max(0, Math.min(255, Math.round(Number(VALUE))));
        // stub: wire up to serial transport when available
        void clamped;
        return Promise.resolve();
    }

    servoWrite ({PIN, ANGLE}) {
        const clamped = Math.max(0, Math.min(180, Math.round(Number(ANGLE))));
        // stub: wire up to serial transport when available
        void clamped;
        return Promise.resolve();
    }
}

module.exports = ThingBotTelemetrix;
