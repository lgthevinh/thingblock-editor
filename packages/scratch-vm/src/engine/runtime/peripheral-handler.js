const ScratchLinkWebSocket = require('../../util/scratch-link-websocket');

/**
 * Owns the hardware-peripheral side of the runtime: the registry of extensions that manage a
 * peripheral connection, and the creation of Scratch Link sockets used to reach peripherals.
 */
class PeripheralHandler {
    constructor () {
        /**
         * Extensions that manage a hardware peripheral connection, keyed by extension id.
         * @type {Object.<string, object>}
         */
        this._extensions = {};

        /**
         * Optional override for the Scratch Link socket factory.
         * @type {?Function}
         */
        this._linkSocketFactory = null;

        this._initScratchLink();
    }

    /**
     * One-time initialization for Scratch Link support.
     * @private
     */
    _initScratchLink () {
        // Check that we're actually in a real browser, not Node.js or JSDOM, and we have a valid-looking origin.
        // note that `if (self?....)` will throw if `self` is undefined, so check for that first!
        if (typeof self !== 'undefined' &&
            typeof document !== 'undefined' &&
            document.getElementById &&
            self.origin &&
            self.origin !== 'null' && // note this is a string comparison, not a null check
            self.navigator &&
            self.navigator.userAgent &&
            !(
                self.navigator.userAgent.includes('Node.js') ||
                self.navigator.userAgent.includes('jsdom')
            )
        ) {
            // Create a script tag for the Scratch Link browser extension, unless one already exists
            const scriptElement = document.getElementById('scratch-link-extension-script');
            if (!scriptElement) {
                const script = document.createElement('script');
                script.id = 'scratch-link-extension-script';
                document.body.appendChild(script);

                // Tell the browser extension to inject its script.
                // If the extension isn't present or isn't active, this will do nothing.
                self.postMessage('inject-scratch-link-script', self.origin);
            }
        }
    }

    /**
     * Get a scratch link socket.
     * @param {string} type Either BLE or BT
     * @returns {ScratchLinkSocket} The scratch link socket.
     */
    getScratchLinkSocket (type) {
        const factory = this._linkSocketFactory || this._defaultScratchLinkSocketFactory;
        return factory(type);
    }

    /**
     * Configure how ScratchLink sockets are created. Factory must consume a "type" parameter
     * either BT or BLE.
     * @param {Function} factory The new factory for creating ScratchLink sockets.
     */
    configureScratchLinkSocketFactory (factory) {
        this._linkSocketFactory = factory;
    }

    /**
     * The default scratch link socket creator, using websockets to the installed device manager.
     * @param {string} type Either BLE or BT
     * @returns {ScratchLinkSocket} The new scratch link socket (a WebSocket object)
     * @private
     */
    _defaultScratchLinkSocketFactory (type) {
        const Scratch = self.Scratch;
        const ScratchLinkSafariSocket = Scratch && Scratch.ScratchLinkSafariSocket;
        // detect this every time in case the user turns on the extension after loading the page
        const useSafariSocket = ScratchLinkSafariSocket && ScratchLinkSafariSocket.isSafariHelperCompatible();
        return useSafariSocket ? new ScratchLinkSafariSocket(type) : new ScratchLinkWebSocket(type);
    }

    /**
     * Register an extension that communicates with a hardware peripheral by id,
     * to have access to it and its peripheral functions in the future.
     * @param {string} extensionId - the id of the extension.
     * @param {object} extension - the extension to register.
     */
    register (extensionId, extension) {
        this._extensions[extensionId] = extension;
    }

    /**
     * Tell the specified extension to scan for a peripheral.
     * @param {string} extensionId - the id of the extension.
     */
    scan (extensionId) {
        if (this._extensions[extensionId]) {
            this._extensions[extensionId].scan();
        }
    }

    /**
     * Connect to the extension's specified peripheral.
     * @param {string} extensionId - the id of the extension.
     * @param {number} peripheralId - the id of the peripheral.
     */
    connect (extensionId, peripheralId) {
        if (this._extensions[extensionId]) {
            this._extensions[extensionId].connect(peripheralId);
        }
    }

    /**
     * Disconnect from the extension's connected peripheral.
     * @param {string} extensionId - the id of the extension.
     */
    disconnect (extensionId) {
        if (this._extensions[extensionId]) {
            this._extensions[extensionId].disconnect();
        }
    }

    /**
     * Returns whether the extension has a currently connected peripheral.
     * @param {string} extensionId - the id of the extension.
     * @returns {boolean} - whether the extension has a connected peripheral.
     */
    isConnected (extensionId) {
        let isConnected = false;
        if (this._extensions[extensionId]) {
            isConnected = this._extensions[extensionId].isConnected();
        }
        return isConnected;
    }
}

module.exports = PeripheralHandler;
