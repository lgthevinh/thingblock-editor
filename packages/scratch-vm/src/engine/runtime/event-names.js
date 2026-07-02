/**
 * Names of the events emitted by {@link Runtime} instances.
 *
 * These are attached to the Runtime class as static properties, so consumers access them as
 * e.g. `Runtime.PROJECT_START`. Every value is identical to its key.
 */
const RuntimeEventNames = {
    /** A script is glowing. */
    SCRIPT_GLOW_ON: 'SCRIPT_GLOW_ON',

    /** A script stopped glowing. */
    SCRIPT_GLOW_OFF: 'SCRIPT_GLOW_OFF',

    /** A block is glowing. */
    BLOCK_GLOW_ON: 'BLOCK_GLOW_ON',

    /** A block stopped glowing. */
    BLOCK_GLOW_OFF: 'BLOCK_GLOW_OFF',

    /** Turbo mode was turned on. */
    TURBO_MODE_ON: 'TURBO_MODE_ON',

    /** Turbo mode was turned off. */
    TURBO_MODE_OFF: 'TURBO_MODE_OFF',

    /** The project was started (threads may not necessarily be running). */
    PROJECT_START: 'PROJECT_START',

    /** Threads started running. Used by the UI to indicate running status. */
    PROJECT_RUN_START: 'PROJECT_RUN_START',

    /** Threads stopped running. Used by the UI to indicate not-running status. */
    PROJECT_RUN_STOP: 'PROJECT_RUN_STOP',

    /** The project was stopped or restarted by the user. Used by blocks that need to reset state. */
    PROJECT_STOP_ALL: 'PROJECT_STOP_ALL',

    /** A target was stopped by a stop-for-target call. Used by blocks that need to stop individual targets. */
    STOP_FOR_TARGET: 'STOP_FOR_TARGET',

    /** A visual value report is available for a block. */
    VISUAL_REPORT: 'VISUAL_REPORT',

    /** The project finished loading into the runtime. */
    PROJECT_LOADED: 'PROJECT_LOADED',

    /** A change was made to the project that can be saved. */
    PROJECT_CHANGED: 'PROJECT_CHANGED',

    /** A change was made to an extension in the toolbox. */
    TOOLBOX_EXTENSIONS_NEED_UPDATE: 'TOOLBOX_EXTENSIONS_NEED_UPDATE',

    /** Target data changed; carries the serialized target list. */
    TARGETS_UPDATE: 'TARGETS_UPDATE',

    /** The monitor state changed; carries the new monitor state. */
    MONITORS_UPDATE: 'MONITORS_UPDATE',

    /** Blocks are being dragged over the GUI. */
    BLOCK_DRAG_UPDATE: 'BLOCK_DRAG_UPDATE',

    /** A block drag ended with the blocks outside the blocks workspace. */
    BLOCK_DRAG_END: 'BLOCK_DRAG_END',

    /** An extension was added. */
    EXTENSION_ADDED: 'EXTENSION_ADDED',

    /** An extension asked for a custom field to be added. */
    EXTENSION_FIELD_ADDED: 'EXTENSION_FIELD_ADDED',

    /**
     * The available set of peripheral devices changed. This causes the peripheral connection
     * modal to update its list of available peripherals.
     */
    PERIPHERAL_LIST_UPDATE: 'PERIPHERAL_LIST_UPDATE',

    /** The user picked a bluetooth device to connect to via Companion Device Manager (CDM). */
    USER_PICKED_PERIPHERAL: 'USER_PICKED_PERIPHERAL',

    /** A peripheral connected. This causes the status button in the blocks menu to indicate 'connected'. */
    PERIPHERAL_CONNECTED: 'PERIPHERAL_CONNECTED',

    /**
     * A peripheral was intentionally disconnected. This causes the status button in the blocks
     * menu to indicate 'disconnected'.
     */
    PERIPHERAL_DISCONNECTED: 'PERIPHERAL_DISCONNECTED',

    /**
     * A peripheral encountered a request error. This causes the peripheral connection modal
     * to switch to an error state.
     */
    PERIPHERAL_REQUEST_ERROR: 'PERIPHERAL_REQUEST_ERROR',

    /** A peripheral connection was lost. This causes a 'peripheral connection lost' error alert to display. */
    PERIPHERAL_CONNECTION_LOST_ERROR: 'PERIPHERAL_CONNECTION_LOST_ERROR',

    /** A peripheral was not discovered. This causes the peripheral connection modal to show a timeout state. */
    PERIPHERAL_SCAN_TIMEOUT: 'PERIPHERAL_SCAN_TIMEOUT',

    /** A firmware device connection opened. */
    DEVICE_CONNECTED: 'DEVICE_CONNECTED',

    /** A firmware device connection closed. */
    DEVICE_DISCONNECTED: 'DEVICE_DISCONNECTED',

    /**
     * A chunk of inbound serial bytes arrived from the connected device's monitor. Distinct from
     * MONITORS_UPDATE (the variable-watcher monitors); this carries raw serial-monitor text.
     */
    SERIAL_DATA: 'SERIAL_DATA',

    /**
     * Helper-served resource packs finished loading, so the device list may have grown and
     * dependent UI (the board library) should refresh.
     */
    RESOURCE_PACKS_LOADED: 'RESOURCE_PACKS_LOADED',

    /**
     * The selected device's active peripheral set changed (a peripheral was added or removed),
     * so the palette and generated code should rebuild.
     */
    PERIPHERALS_CHANGED: 'PERIPHERALS_CHANGED',

    /**
     * A loaded project's saved board (device + user peripherals) was restored, so the editor
     * can sync its board selection UI to match the project.
     */
    BOARD_RESTORED: 'BOARD_RESTORED',

    /** The microphone is (or stopped) being used to stream audio. */
    MIC_LISTENING: 'MIC_LISTENING',

    /** Extension data started or finished loading. */
    EXTENSION_DATA_LOADING: 'EXTENSION_DATA_LOADING',

    /** An extension's block info was updated. */
    BLOCKSINFO_UPDATE: 'BLOCKSINFO_UPDATE',

    /** The runtime tick loop was started. */
    RUNTIME_STARTED: 'RUNTIME_STARTED',

    /** The runtime was disposed. */
    RUNTIME_DISPOSED: 'RUNTIME_DISPOSED',

    /** A block was updated and needs to be rerendered. */
    BLOCKS_NEED_UPDATE: 'BLOCKS_NEED_UPDATE'
};

module.exports = Object.freeze(RuntimeEventNames);
