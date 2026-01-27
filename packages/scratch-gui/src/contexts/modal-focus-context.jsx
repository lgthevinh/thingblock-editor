import React, {createContext, useRef, useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';

export const ModalFocusContext = createContext(null);

const ALLOW_SELECTOR = '[data-focusable]';

/**
 * A context provider that manages focus restoration strategies for modals.
 *
 * It keeps track of the element that was focused prior to a modal opening (`captureFocus`)
 * and attempts to restore focus to that element when the modal closes (`restoreFocus`).
 * It can make all other elements outside the modal unfocusable via tab (`restrictFocusableElements`)
 * and return their original focusability (`unrestrictFocusableElements`).
 *
 * This uses a ref to store the DOM element, ensuring that focus restoration only occurs
 * if the original element is still connected to the DOM.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 * @returns {React.ReactElement} The Context Provider wrapping the children.
 */
export const ModalFocusProvider = ({children}) => {
    const lastFocusedElement = useRef(null);

    const captureFocus = useCallback(() => {
        lastFocusedElement.current = document.activeElement;
    }, []);

    const restoreFocus = useCallback(() => {
        if (lastFocusedElement.current?.isConnected) {
            lastFocusedElement.current.focus();
            lastFocusedElement.current = null;
        }
    }, []);

    // We set all other elements to -1 so 'tab' can't access them
    const makeUnfocusable = el => {
        if (el.tabIndex >= 0) {
            el.dataset.prevTabIndex = el.tabIndex;
            el.tabIndex = -1;
        }
    };

    // We restore their original 'tabIndex'
    const restoreTabIndex = el => {
        if (el.dataset.prevTabIndex) {
            el.tabIndex = Number(el.dataset.prevTabIndex);
            delete el.dataset.prevTabIndex;
        }
    };

    const restrictFocusableElements = useCallback(() => {
        const allElements = document.body.querySelectorAll('*');

        allElements.forEach(el => {
            if (!el.matches(ALLOW_SELECTOR)) {
                makeUnfocusable(el);
            }
        });
    }, []);

    const unrestrictFocusableElements = useCallback(() => {
        const allElements = document.body.querySelectorAll('*');

        allElements.forEach(el => {
            restoreTabIndex(el);
        });
    }, []);

    const value = useMemo(
        () => ({
            captureFocus,
            restoreFocus,
            restrictFocusableElements,
            unrestrictFocusableElements
        }),
        [
            captureFocus,
            restoreFocus,
            restrictFocusableElements,
            unrestrictFocusableElements
        ]
    );

    return (
        <ModalFocusContext.Provider value={value}>
            {children}
        </ModalFocusContext.Provider>
    );
};


ModalFocusProvider.propTypes = {
    children: PropTypes.node
};
