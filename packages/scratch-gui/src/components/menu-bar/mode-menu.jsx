import React from 'react';
import styles from './menu-bar.css';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import {FormattedMessage, defineMessage} from 'react-intl';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import BaseMenu from './base-menu';

import intlShape from '../../lib/intlShape.js';
const modeMenu = defineMessage({
    id: 'modeMenu.aria.modeMenu',
    defaultMessage: 'Mode menu',
    description: 'ARIA label for mode menu'
});

export class ModeMenu extends BaseMenu {
    constructor (props) {
        super(props);

        this.normalRef = React.createRef();
        this.caturdayRef = React.createRef();
        
        this.itemRefs = [
            this.normalRef,
            this.caturdayRef
        ];
    }

    render () {
        const {
            intl,
            isRtl,
            mode2020,
            modeNow,
            onSetMode
        } = this.props;

        return (
            <div
                className={classNames(styles.menuBarItem, styles.hoverable, {
                    [styles.active]: this.isExpanded()
                })}
                onClick={this.handleOnOpen}
                role="button"
                aria-label={intl.formatMessage(modeMenu)}
                aria-expanded={this.isExpanded()}
                tabIndex={0}
                onKeyDown={this.handleKeyPress}
            >
                <div className={classNames(styles.editMenu)}>
                    <FormattedMessage
                        defaultMessage="Mode"
                        description="Mode menu item in the menu bar"
                        id="gui.menuBar.modeMenu"
                    />
                </div>
                <MenuBarMenu
                    className={classNames(styles.menuBarMenu)}
                    open={this.isExpanded()}
                    place={isRtl ? 'left' : 'right'}
                    onRequestClose={this.handleOnClose}
                >
                    <MenuSection>
                        <MenuItem
                            onClick={onSetMode('NOW')}
                            menuRef={this.normalRef}
                            onParentKeyPress={this.handleKeyPressOpenMenu}
                        >
                            <span className={classNames({[styles.inactive]: !modeNow})}>
                                {'✓'}
                            </span>
                            {' '}
                            <FormattedMessage
                                defaultMessage="Normal mode"
                                description="April fools: resets editor to not have any pranks"
                                id="gui.menuBar.normalMode"
                            />
                        </MenuItem>
                        <MenuItem
                            onClick={onSetMode('2020')}
                            menuRef={this.caturdayRef}
                            onParentKeyPress={this.handleKeyPressOpenMenu}
                        >
                            <span className={classNames({[styles.inactive]: !mode2020})}>
                                {'✓'}
                            </span>
                            {' '}
                            <FormattedMessage
                                defaultMessage="Caturday mode"
                                description="April fools: Cat blocks mode"
                                id="gui.menuBar.caturdayMode"
                            />
                        </MenuItem>
                    </MenuSection>
                </MenuBarMenu>
            </div>
        );
    }
}

ModeMenu.propTypes = {
    intl: intlShape,
    menuRef: PropTypes.shape({current: PropTypes.instanceOf(Element)}),
    onSetMode: PropTypes.func,
    modeNow: PropTypes.bool,
    mode2020: PropTypes.bool,
    isRtl: PropTypes.bool

};

export default ModeMenu;
