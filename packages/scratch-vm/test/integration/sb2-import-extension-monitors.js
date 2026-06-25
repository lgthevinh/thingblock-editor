const path = require('path');
const tap = require('tap');
const test = tap.test;
const makeTestStorage = require('../fixtures/make-test-storage');
const {readFileToBuffer} = require('../fixtures/readProjectFile');
const VirtualMachine = require('../../src/index');

const invisibleTempoMonitorProjectUri = path.resolve(
    __dirname, '../fixtures/invisible-tempo-monitor-no-other-music-blocks.sb2');
const invisibleTempoMonitorProject = readFileToBuffer(invisibleTempoMonitorProjectUri);

const visibleTempoMonitorProjectUri = path.resolve(
    __dirname, '../fixtures/visible-tempo-monitor-no-other-music-blocks.sb2');
const visibleTempoMonitorProject = readFileToBuffer(visibleTempoMonitorProjectUri);

test('sb2 project with invisible music monitor should not load monitor or extension', t => {
    const vm = new VirtualMachine();
    vm.attachStorage(makeTestStorage());

    // Start VM, load project, and run
    vm.start();
    vm.clear();
    vm.setCompatibilityMode(false);
    vm.setTurboMode(false);
    vm.loadProject(invisibleTempoMonitorProject).then(() => {
        t.equal(vm.extensionManager.isExtensionLoaded('music'), false);
        t.equal(vm.runtime._monitorState.size, 0);
        vm.quit();
        t.end();
    });
});

test('sb2 project with visible music monitor should load monitor and extension', t => {
    const vm = new VirtualMachine();
    vm.attachStorage(makeTestStorage());

    // Start VM, load project, and run
    vm.start();
    vm.clear();
    vm.setCompatibilityMode(false);
    vm.setTurboMode(false);
    vm.loadProject(visibleTempoMonitorProject).then(() => {
        t.equal(vm.extensionManager.isExtensionLoaded('music'), true);
        t.equal(vm.runtime._monitorState.size, 1);
        t.equal(vm.runtime._monitorState.has('music_getTempo'), true);
        t.equal(vm.runtime._monitorState.get('music_getTempo').visible, true);
        vm.quit();
        t.end();
    });
});
