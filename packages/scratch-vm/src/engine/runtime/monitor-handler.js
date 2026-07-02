const {OrderedMap} = require('immutable');

const RuntimeEventNames = require('./event-names');

/**
 * Owns the runtime's monitor state: the ordered map of monitor records shown in the GUI,
 * and the once-per-step change detection that publishes it.
 */
class MonitorHandler {
    constructor (runtime) {
        /**
         * The runtime that monitor updates are emitted on.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * Ordered map of all monitors, which are MonitorReporter objects.
         */
        this._state = OrderedMap({});

        /**
         * Monitor state as of the last emitted update.
         */
        this._prevState = OrderedMap({});
    }

    /**
     * @returns {OrderedMap} The current monitor state.
     */
    getState () {
        return this._state;
    }

    /**
     * Add a monitor to the state. If the monitor already exists in the state,
     * updates those properties that are defined in the given monitor record.
     * @param {!MonitorRecord} monitor Monitor to add.
     */
    add (monitor) {
        const id = monitor.get('id');
        if (!this.update(monitor)) { // update monitor if it exists in the state
            // if the monitor did not exist in the state, add it
            this._state = this._state.set(id, monitor);
        }
    }

    /**
     * Update a monitor in the state and report success/failure of update.
     * @param {!Map} monitor Monitor values to update. Values on the monitor with overwrite
     *     values on the old monitor with the same ID. If a value isn't defined on the new monitor,
     *     the old monitor will keep its old value.
     * @returns {boolean} true if monitor exists in the state and was updated, false if it did not exist.
     */
    update (monitor) {
        const id = monitor.get('id');
        if (this._state.has(id)) {
            this._state =
                // Use mergeWith here to prevent undefined values from overwriting existing ones
                this._state.set(id, this._state.get(id).mergeWith((prev, next) => {
                    if (typeof next === 'undefined' || next === null) {
                        return prev;
                    }
                    return next;
                }, monitor));
            return true;
        }
        return false;
    }

    /**
     * Removes a monitor from the state. Does nothing if the monitor already does
     * not exist in the state.
     * @param {!string} monitorId ID of the monitor to remove.
     */
    remove (monitorId) {
        this._state = this._state.delete(monitorId);
    }

    /**
     * Hides a monitor and returns success/failure of action.
     * @param {!string} monitorId ID of the monitor to hide.
     * @returns {boolean} true if monitor exists and was updated, false otherwise
     */
    hide (monitorId) {
        return this.update(new Map([
            ['id', monitorId],
            ['visible', false]
        ]));
    }

    /**
     * Shows a monitor and returns success/failure of action.
     * @param {!string} monitorId ID of the monitor to show.
     * @returns {boolean} true if monitor exists and was updated, false otherwise
     */
    show (monitorId) {
        return this.update(new Map([
            ['id', monitorId],
            ['visible', true]
        ]));
    }

    /**
     * Removes all monitors with the given target ID from the state. Does nothing if
     * the monitor already does not exist in the state.
     * @param {!string} targetId Remove all monitors with given target ID.
     */
    removeByTargetId (targetId) {
        this._state = this._state.filterNot(value => value.targetId === targetId);
    }

    /**
     * Emit a monitors update on the runtime if the state changed since the last emit.
     * Called once per step.
     */
    emitIfChanged () {
        if (!this._prevState.equals(this._state)) {
            this.runtime.emit(RuntimeEventNames.MONITORS_UPDATE, this._state);
            this._prevState = this._state;
        }
    }

    /**
     * Clear all monitor state, e.g. when the project is disposed.
     */
    reset () {
        this._state = OrderedMap({});
    }
}

module.exports = MonitorHandler;
