import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import ActionMenu from '../../../src/components/action-menu/action-menu.jsx';
import {KEY} from '../../../src/lib/navigation-keys';
import React, {act} from 'react';

// Mock the CSS module so class names exist
jest.mock('../../../src/components/action-menu/action-menu.css', () => ({
    expanded: 'expanded'
}));

describe('ActionMenu keyboard navigation', () => {
    const mockOnClick = jest.fn();
    const mockMoreButtonClick = jest.fn();

    const defaultProps = {
        title: 'Main Button',
        img: 'main-icon.svg',
        onClick: mockOnClick,
        moreButtons: [
            {title: 'Button 1', img: 'icon1.svg', onClick: mockMoreButtonClick},
            {title: 'Button 2', img: 'icon2.svg', onClick: mockMoreButtonClick},
            {title: 'Button 3', img: 'icon3.svg', onClick: mockMoreButtonClick}
        ]
    };

    beforeEach(() => {
        mockOnClick.mockClear();
        mockMoreButtonClick.mockClear();
    });

    test('focus on main button expands menu', () => {
        render(<ActionMenu {...defaultProps} />);
        const mainButton = screen.getByRole('button', {name: 'Main Button'});

        act(() => {
            mainButton.focus();
        });

        expect(mainButton.parentElement).toHaveClass('expanded');
    });

    test('arrow_down focuses first item, arrow_up focuses last item', async () => {
        render(<ActionMenu {...defaultProps} />);
        const mainButton = screen.getByRole('button', {name: 'Main Button'});

        act(() => {
            mainButton.focus();
            fireEvent.keyDown(mainButton, {key: KEY.ARROW_DOWN});
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(screen.getByRole('button', {name: 'Button 1'}));
        });

        act(() => {
            mainButton.focus();
            fireEvent.keyDown(mainButton, {key: KEY.ARROW_UP});
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(screen.getByRole('button', {name: 'Button 3'}));
        });
    });

    test('arrow_up from first item cycles to last, arrow_down from last cycles to first', async () => {
        render(<ActionMenu {...defaultProps} />);

        const firstItem = screen.getByRole('button', {name: 'Button 1'});
        const lastItem = screen.getByRole('button', {name: 'Button 3'});

        act(() => {
            firstItem.focus();
            fireEvent.keyDown(firstItem, {key: KEY.ARROW_UP});
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(lastItem);
        });

        act(() => {
            fireEvent.keyDown(lastItem, {key: KEY.ARROW_DOWN});
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(firstItem);
        });
    });
    
    test('escape returns focus to main button', async () => {
        render(<ActionMenu {...defaultProps} />);
        const mainButton = screen.getByRole('button', {name: 'Main Button'});
        const firstItem = screen.getByRole('button', {name: 'Button 1'});

        act(() => {
            firstItem.focus();
            fireEvent.keyDown(firstItem, {key: KEY.ESCAPE});
        });

        await waitFor(() => {
            expect(document.activeElement).toBe(mainButton);
        });
    });

    test('tab closes menu and focuses next element', async () => {
        render(
            <>
                <ActionMenu {...defaultProps} />
                <button>After Menu</button>
            </>
        );
        const firstItem = screen.getByRole('button', {name: 'Button 1'});
        const afterButton = screen.getByRole('button', {name: 'After Menu'});
        const user = userEvent.setup();

        act(() => {
            firstItem.focus();
        });

        await user.tab();

        await waitFor(() => {
            expect(document.activeElement).toBe(afterButton);
            expect(screen.getByRole('button', {name: 'Main Button'}).parentElement).not.toHaveClass('expanded');
        });
    });

    test('shift + tab closes menu and focuses previous element', async () => {
        render(
            <>
                <button>Before Menu</button>
                <ActionMenu {...defaultProps} />
            </>
        );

        const mainButton = screen.getByRole('button', {name: 'Main Button'});
        const beforeButton = screen.getByRole('button', {name: 'Before Menu'});
        const user = userEvent.setup();

        act(() => {
            mainButton.focus();
        });

        await user.tab({shift: true});

        await waitFor(() => {
            expect(document.activeElement).toBe(beforeButton);
            expect(mainButton.parentElement).not.toHaveClass('expanded');
        });
    });
});
