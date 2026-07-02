/**
 * Owns script-glow feedback: tracking which scripts glowed during the previous frame and
 * emitting glow on/off events as threads start and stop.
 */
class GlowFeedback {
    constructor (runtime) {
        /**
         * The runtime whose threads are inspected and whose glow events are emitted.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * A list of script block IDs that were glowing during the previous frame.
         * @type {!Array.<!string>}
         */
        this._scriptGlowsPreviousFrame = [];
    }

    /**
     * Emit glows/glow clears for scripts after a single tick.
     * Looks at the runtime's threads and notices which have turned on/off new glows.
     * @param {Array.<Thread>=} optExtraThreads Optional list of inactive threads.
     */
    update (optExtraThreads) {
        const searchThreads = [];
        searchThreads.push(...this.runtime.threads);
        if (optExtraThreads) {
            searchThreads.push(...optExtraThreads);
        }
        // Set of scripts that request a glow this frame.
        const requestedGlowsThisFrame = [];
        // Final set of scripts glowing during this frame.
        const finalScriptGlows = [];
        // Find all scripts that should be glowing.
        for (let i = 0; i < searchThreads.length; i++) {
            const thread = searchThreads[i];
            const target = thread.target;
            if (target === this.runtime.getEditingTarget()) {
                const blockForThread = thread.blockGlowInFrame;
                if (thread.requestScriptGlowInFrame || thread.stackClick) {
                    let script = target.blocks.getTopLevelScript(blockForThread);
                    if (!script) {
                        // Attempt to find in flyout blocks.
                        script = this.runtime.flyoutBlocks.getTopLevelScript(
                            blockForThread
                        );
                    }
                    if (script) {
                        requestedGlowsThisFrame.push(script);
                    }
                }
            }
        }
        // Compare to previous frame.
        for (let j = 0; j < this._scriptGlowsPreviousFrame.length; j++) {
            const previousFrameGlow = this._scriptGlowsPreviousFrame[j];
            if (requestedGlowsThisFrame.indexOf(previousFrameGlow) < 0) {
                // Glow turned off.
                this.runtime.glowScript(previousFrameGlow, false);
            } else {
                // Still glowing.
                finalScriptGlows.push(previousFrameGlow);
            }
        }
        for (let k = 0; k < requestedGlowsThisFrame.length; k++) {
            const currentFrameGlow = requestedGlowsThisFrame[k];
            if (this._scriptGlowsPreviousFrame.indexOf(currentFrameGlow) < 0) {
                // Glow turned on.
                this.runtime.glowScript(currentFrameGlow, true);
                finalScriptGlows.push(currentFrameGlow);
            }
        }
        this._scriptGlowsPreviousFrame = finalScriptGlows;
    }

    /**
     * "Quiet" a script's glow: stop generating glow/unglow events about that script.
     * Use when a script has just been deleted, but we may still be tracking glow data about it.
     * @param {!string} scriptBlockId Id of top-level block in script to quiet.
     */
    quiet (scriptBlockId) {
        const index = this._scriptGlowsPreviousFrame.indexOf(scriptBlockId);
        if (index > -1) {
            this._scriptGlowsPreviousFrame.splice(index, 1);
        }
    }

    /**
     * Drop all tracked glows without emitting glow-off events,
     * e.g. when the editing target changes.
     */
    clear () {
        this._scriptGlowsPreviousFrame = [];
    }
}

module.exports = GlowFeedback;
