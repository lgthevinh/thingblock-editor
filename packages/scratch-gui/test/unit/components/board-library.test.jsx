import React from 'react';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import BoardLibrary from '../../../src/containers/board-library.jsx';

jest.mock('../../../src/components/library/library.jsx', () => {
    const MockLibraryComponent = ({data, fixedItemSize, visible}) => (
        visible ? (
            <div>
                {data.map(item => (
                    <div
                        className={fixedItemSize ? 'featuredItemFixed' : null}
                        key={item.boardId}
                    >
                        {item.name}
                    </div>
                ))}
            </div>
        ) : null
    );
    return MockLibraryComponent;
});

describe('BoardLibrary', () => {
    const renderBoardLibrary = (visible = true) => {
        const store = configureStore()({
            scratchGui: {
                modals: {
                    boardLibrary: visible
                }
            }
        });

        return render(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <BoardLibrary />
                </IntlProvider>
            </Provider>
        );
    };

    test('renders board names when visible', () => {
        renderBoardLibrary();

        expect(screen.getByText('Arduino Uno')).toBeInTheDocument();
        expect(screen.getByText('Arduino Nano')).toBeInTheDocument();
        expect(screen.getByText('ESP32 Dev Module')).toBeInTheDocument();
    });

    test('renders board items with fixed-size styling', () => {
        renderBoardLibrary();

        expect(screen.getByText('Arduino Uno')).toHaveClass('featuredItemFixed');
    });

    test('renders nothing when not visible', () => {
        const {container} = renderBoardLibrary(false);

        expect(container).toBeEmptyDOMElement();
    });
});
