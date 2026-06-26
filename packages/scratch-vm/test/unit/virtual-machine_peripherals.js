const tap = require('tap');
const VirtualMachine = require('../../src/virtual-machine');

const test = tap.test;

const deviceBase = 'http://localhost:3030/resources/extensions/devices/thingbot';
const coreBase = 'http://localhost:3030/resources/extensions/peripheral/thingbot-core';
const servoBase = 'http://localhost:3030/resources/extensions/peripheral/servo';

// A device that references two peripherals by id: its own hidden pack (the device-exclusive surface)
// first, then a reusable component. There is no separate device-extension type — both are peripherals.
const deviceManifest = {
    id: 'thingbot',
    kind: 'device',
    name: 'ThingBot',
    fqbn: 'esp32:esp32:esp32c3',
    icon: './icon.svg',
    description: {id: 'device.thingbot.description', default: 'A ThingEdu ESP32-C3 board.'},
    manufacturer: 'ThingEdu',
    requires: 'serial',
    extensions: ['thingbot-core', 'servo']
};

const coreManifest = {
    id: 'thingbot-core',
    kind: 'peripheral',
    name: 'ThingBot',
    hidden: true,
    blocks: './blocks.js',
    generator: './generator.js',
    toolbox: './toolbox.js',
    libs: [{path: 'libs/ThingBot'}]
};
const coreToolbox = {kind: 'category', name: 'ThingBot', contents: [{kind: 'block', type: 'thingbot_digitalwrite'}]};

const servoManifest = {
    id: 'servo',
    kind: 'peripheral',
    name: 'Servo',
    blocks: './blocks.js',
    generator: './generator.js',
    toolbox: './toolbox.js',
    libs: [{path: 'libs/Servo'}]
};
const servoToolbox = {kind: 'category', name: 'Servo', contents: [{kind: 'block', type: 'servo_setangle'}]};

// A VM whose pack imports are served from in-memory modules; `counts` records imports per URL so a
// re-selection can be shown to skip re-importing the registered modules. ThingBot references both the
// hidden core pack and the servo peripheral, so one device selection reaches both.
const makeVM = () => {
    const vm = new VirtualMachine();
    const counts = {};
    const modules = {
        [`${coreBase}/toolbox.js`]: {default: coreToolbox},
        [`${coreBase}/blocks.js`]: {registerBlocks: Blockly => {
            Blockly.Blocks.thingbot_digitalwrite = {};
        }},
        [`${coreBase}/generator.js`]: {registerGenerators: (generator, Order) => {
            generator.forBlock.thingbot_digitalwrite = () => `digitalWrite(2, HIGH);${Order.ATOMIC}`;
        }},
        [`${servoBase}/toolbox.js`]: {default: servoToolbox},
        [`${servoBase}/blocks.js`]: {registerBlocks: Blockly => {
            Blockly.Blocks.servo_setangle = {};
        }},
        [`${servoBase}/generator.js`]: {registerGenerators: (generator, Order) => {
            generator.forBlock.servo_setangle = () => `servo.write(90);${Order.ATOMIC}`;
        }}
    };
    vm._importPackModule = url => {
        counts[url] = (counts[url] || 0) + 1;
        if (!(url in modules)) return Promise.reject(new Error(`404 ${url}`));
        return Promise.resolve(modules[url]);
    };
    vm.registerDeviceManifest(deviceManifest, deviceBase);
    vm.registerPeripheralManifest(coreManifest, coreBase);
    vm.registerPeripheralManifest(servoManifest, servoBase);
    return {vm, counts};
};

const makeScratchBlocks = () => ({
    Blocks: {},
    arduinoGenerator: {forBlock: {}},
    ArduinoOrder: {ATOMIC: 0, NONE: 99}
});

test('selectDevice registers each referenced peripheral\'s blocks and codegen on the injected singleton', async t => {
    const {vm} = makeVM();
    const scratchBlocks = makeScratchBlocks();
    vm.setScratchBlocks(scratchBlocks);

    await vm.selectDevice('thingbot');

    t.ok(scratchBlocks.Blocks.thingbot_digitalwrite, 'hidden core block registered on the shared Blockly');
    t.ok(scratchBlocks.Blocks.servo_setangle, 'reusable peripheral block registered on the shared Blockly');
    t.type(
        scratchBlocks.arduinoGenerator.forBlock.thingbot_digitalwrite,
        'function',
        'core codegen registered on the shared arduinoGenerator'
    );
    t.type(
        scratchBlocks.arduinoGenerator.forBlock.servo_setangle,
        'function',
        'peripheral codegen registered on the shared arduinoGenerator'
    );

    t.same(
        vm.getActivePeripheralToolboxCategories(),
        [coreToolbox, servoToolbox],
        'toolbox categories follow the device extensions order (own pack first)'
    );
    t.same(
        vm.getActivePeripheralLibs(),
        [{path: 'libs/ThingBot'}, {path: 'libs/Servo'}],
        'libs aggregate across active peripherals in order'
    );

    t.end();
});

test('getActivePeripheral* reflect the active device and clear on deselect', async t => {
    const {vm} = makeVM();
    vm.setScratchBlocks(makeScratchBlocks());

    t.same(vm.getActivePeripheralToolboxCategories(), [], 'no categories before a device is selected');
    t.same(vm.getActivePeripheralLibs(), [], 'no libs before a device is selected');

    await vm.selectDevice('thingbot');
    t.same(vm.getActivePeripheralToolboxCategories(), [coreToolbox, servoToolbox], 'surfaces active categories');

    await vm.selectDevice(null);
    t.same(vm.getActivePeripheralToolboxCategories(), [], 'categories cleared after deselect');
    t.same(vm.getActivePeripheralLibs(), [], 'libs cleared after deselect');

    t.end();
});

test('records peripherals headless: toolbox/libs recorded, blocks skipped', async t => {
    const {vm, counts} = makeVM();
    // No setScratchBlocks: headless.

    await vm.selectDevice('thingbot');

    t.same(vm.getActivePeripheralToolboxCategories(), [coreToolbox, servoToolbox], 'toolbox recorded without a handle');
    t.same(
        vm.getActivePeripheralLibs(),
        [{path: 'libs/ThingBot'}, {path: 'libs/Servo'}],
        'libs recorded without a handle'
    );
    t.notOk(counts[`${coreBase}/blocks.js`], 'did not import core blocks without a handle');
    t.notOk(counts[`${servoBase}/blocks.js`], 'did not import peripheral blocks without a handle');

    t.end();
});

test('re-selecting a device re-activates without re-importing its modules', async t => {
    const {vm, counts} = makeVM();
    vm.setScratchBlocks(makeScratchBlocks());

    await vm.selectDevice('thingbot');
    await vm.selectDevice(null);
    await t.resolves(vm.selectDevice('thingbot'), 're-selection does not throw');

    t.same(vm.getActivePeripheralToolboxCategories(), [coreToolbox, servoToolbox], 're-activated');
    t.equal(counts[`${coreBase}/blocks.js`], 1, 'core blocks imported once');
    t.equal(counts[`${servoBase}/blocks.js`], 1, 'peripheral blocks imported once');

    t.end();
});

test('selecting null or a built-in board clears the active peripherals', async t => {
    const {vm} = makeVM();
    vm.setScratchBlocks(makeScratchBlocks());

    await vm.selectDevice('thingbot');
    await vm.selectDevice(null);
    t.same(vm.getActivePeripheralToolboxCategories(), [], 'null selection clears active peripherals');

    await vm.selectDevice('thingbot');
    await vm.selectDevice('esp32c3');
    t.same(vm.getActivePeripheralToolboxCategories(), [], 'a built-in board (no pack) clears active peripherals');

    t.end();
});

test('a device referencing an unknown peripheral skips it without throwing', async t => {
    const {vm} = makeVM();
    vm.setScratchBlocks(makeScratchBlocks());
    vm.registerDeviceManifest(
        {id: 'ghost', kind: 'device', name: 'Ghost', fqbn: 'x:y:z', icon: './icon.svg',
            description: {id: 'd', default: 'd'}, manufacturer: 'x', requires: 'serial',
            extensions: ['does-not-exist', 'servo']},
        deviceBase
    );

    await t.resolves(vm.selectDevice('ghost'), 'unknown peripheral does not break selection');
    t.same(vm.getActivePeripheralToolboxCategories(), [servoToolbox], 'the known peripheral still activates');

    t.end();
});
