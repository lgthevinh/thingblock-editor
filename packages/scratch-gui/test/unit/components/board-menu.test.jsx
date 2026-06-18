import React from 'react';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import BoardMenu from '../../../src/components/menu-bar/board-menu.jsx';
import {boardMap} from '../../../src/lib/boards';

describe('BoardMenu', () => {
    const renderBoardMenu = (selectedBoardId = 'arduino:avr:uno') => {
        const store = configureStore()({
            scratchGui: {
                board: {selectedBoardId}
            }
        });

        return {
            store,
            ...render(
                <Provider store={store}>
                    <IntlProvider locale="en">
                        <BoardMenu />
                    </IntlProvider>
                </Provider>
            )
        };
    };

    test('renders "Select board" when no board is selected', () => {
        renderBoardMenu(null);
        expect(screen.getByRole('button', {name: 'Select board'})).toBeInTheDocument();
    });

    test('renders with the selected board name', () => {
        renderBoardMenu('arduino:avr:uno');

        expect(screen.getByRole('button', {
            name: `Board: ${boardMap['arduino:avr:uno'].name}`
        })).toBeInTheDocument();
    });

    test('clicking opens the board library', () => {
        const {store} = renderBoardMenu('arduino:avr:uno');

        fireEvent.click(screen.getByRole('button', {
            name: `Board: ${boardMap['arduino:avr:uno'].name}`
        }));

        expect(store.getActions()).toEqual([{
            type: 'scratch-gui/modals/OPEN_MODAL',
            modal: 'boardLibrary'
        }]);
    });
});
