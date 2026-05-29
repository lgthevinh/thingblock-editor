const Module = require('module');
const {TestEnvironment} = require('jest-environment-jsdom');

class ScratchPaintCanvasEnvironment extends TestEnvironment {
    constructor (config, context) {
        const canvasEntry = require.resolve('canvas');
        const originalResolveFilename = Module._resolveFilename;

        Module._resolveFilename = function (request, parent, isMain, options) {
            if (request === 'canvas') {
                return canvasEntry;
            }
            return originalResolveFilename.call(this, request, parent, isMain, options);
        };

        try {
            super(config, context);
        } finally {
            Module._resolveFilename = originalResolveFilename;
        }
    }
}

module.exports = ScratchPaintCanvasEnvironment;
