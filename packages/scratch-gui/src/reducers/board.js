const SET_BOARD = 'scratch-gui/board/SET_BOARD';

const initialState = {
    selectedBoardId: null
};

const reducer = function (state = initialState, action) {
    switch (action.type) {
    case SET_BOARD:
        return {...state, selectedBoardId: action.boardId};
    default:
        return state;
    }
};

const setBoard = boardId => ({
    type: SET_BOARD,
    boardId
});

export {
    reducer as default,
    initialState as boardInitialState,
    setBoard
};
