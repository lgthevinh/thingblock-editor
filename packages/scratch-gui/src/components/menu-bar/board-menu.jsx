import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessage, useIntl} from 'react-intl';
import {connect} from 'react-redux';

import {boardMap} from '../../lib/boards';
import {openBoardLibrary} from '../../reducers/modals';

import menuBarStyles from './menu-bar.css';
import styles from './board-menu.css';

const boardMenuMessage = defineMessage({
    id: 'gui.menuBar.board',
    defaultMessage: 'Board: {boardName}',
    description: 'Board selection menu item in the menu bar'
});

const selectBoardMessage = defineMessage({
    id: 'gui.menuBar.selectBoard',
    defaultMessage: 'Select board',
    description: 'Board menu button label when no board has been selected'
});

const BoardMenu = ({
    selectedBoardId,
    onOpenBoardLibrary
}) => {
    const intl = useIntl();
    const selectedBoardName = selectedBoardId ? boardMap[selectedBoardId]?.name : null;
    const label = selectedBoardName
        ? intl.formatMessage(boardMenuMessage, {boardName: selectedBoardName})
        : intl.formatMessage(selectBoardMessage);

    return (
        <button
            className={classNames(menuBarStyles.menuBarItem, menuBarStyles.hoverable)}
            aria-label={label}
            onClick={onOpenBoardLibrary}
        >
            <span className={styles.label}>{label}</span>
        </button>
    );
};

BoardMenu.propTypes = {
    onOpenBoardLibrary: PropTypes.func.isRequired,
    selectedBoardId: PropTypes.string
};

const mapStateToProps = state => ({
    selectedBoardId: state.scratchGui.board.selectedBoardId
});

const mapDispatchToProps = dispatch => ({
    onOpenBoardLibrary: () => dispatch(openBoardLibrary())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BoardMenu);
