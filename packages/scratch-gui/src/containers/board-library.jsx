import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import intlShape from '../lib/intlShape.js';

import boardLibraryContent from '../lib/libraries/boards/index.jsx';

import LibraryComponent from '../components/library/library.jsx';
import {closeBoardLibrary} from '../reducers/modals';
import {setBoard} from '../reducers/board';

const messages = defineMessages({
    boardTitle: {
        defaultMessage: 'Choose a Board',
        description: 'Heading for the board selection library',
        id: 'gui.boardLibrary.chooseABoard'
    }
});

class BoardLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
    }
    handleItemSelect (item) {
        this.props.onSelectBoard(item.boardId);
    }
    render () {
        if (!this.props.visible) return null;

        const boardLibraryThumbnailData = boardLibraryContent.map(board => ({
            rawURL: board.iconURL,
            ...board
        }));
        return (
            <LibraryComponent
                data={boardLibraryThumbnailData}
                filterable={false}
                fixedItemSize
                id="boardLibrary"
                title={this.props.intl.formatMessage(messages.boardTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

BoardLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    onSelectBoard: PropTypes.func,
    visible: PropTypes.bool
};

const mapStateToProps = state => ({
    visible: state.scratchGui.modals.boardLibrary
});

const mapDispatchToProps = dispatch => ({
    onRequestClose: () => dispatch(closeBoardLibrary()),
    onSelectBoard: boardId => dispatch(setBoard(boardId))
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(BoardLibrary));
