/**
 * Board mode is active when a board is selected (`state.scratchGui.board.selectedBoardId`).
 * It mirrors the code-generation language: board mode -> arduino-cpp, host mode -> js.
 */

// Dynamic extension category IDs that should only appear in the palette when a board is selected.
const BOARD_ONLY_CATEGORY_IDS = ['arduino'];

export {
    BOARD_ONLY_CATEGORY_IDS
};
