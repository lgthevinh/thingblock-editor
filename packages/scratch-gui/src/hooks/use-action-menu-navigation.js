import {useCallback, useState, useRef} from 'react';
import {KEY} from '../lib/navigation-keys';
import ReactTooltip from 'react-tooltip';

const MENU_ITEM_SELECTOR = '[data-action-menu-item="true"]';

export default function useActionMenuNavigation () {
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // BFS to find first children with attribute
    const findSubitems = useCallback(() => {
        if (!containerRef?.current) return [];
        const subitems = [];
        const root = containerRef.current;
        const children = [...root.children];

        while (children.length > 0) {
            // if child is a menu item itself
            const element = children.shift();
            if (element.matches(MENU_ITEM_SELECTOR)) {
                subitems.push(element);
            } else {
                children.push(...element.children);
            }
        }

        return subitems;
    }, [containerRef]);

    const focusItem = useCallback(item => {
        if (item) {
            item.focus();
        }
    }, []);

    const handleOnFocus = useCallback(() => {
        setIsExpanded(true);
        const items = findSubitems();
        if (!items.length) return;

        // default to last item (first above)
        const lastItem = items[items.length - 1];
        focusItem(lastItem);
    }, [findSubitems, focusItem, setIsExpanded]);

    const handleMove = useCallback(direction => {
        const items = findSubitems();
        if (!items.length) return;

        const currentIndex = items.indexOf(document.activeElement);
        const nextIndex = (currentIndex + direction + items.length) % items.length;
        focusItem(items[nextIndex]);
    }, [findSubitems, focusItem]);

    const handleKeyDown = useCallback(e => {
        switch (e.key) {
        case KEY.ARROW_DOWN:
            e.preventDefault();
            e.stopPropagation();
            handleMove(1);
            break;
        case KEY.ARROW_UP:
            e.preventDefault();
            e.stopPropagation();
            handleMove(-1);
            break;
        case KEY.TAB:
            if (isExpanded) setIsExpanded(false);
            buttonRef?.current?.blur();

            return;
        }
    }, [handleMove, isExpanded, setIsExpanded, buttonRef]);

    return {
        containerRef,
        buttonRef,
        isExpanded,
        setIsExpanded,
        handleKeyDown,
        handleOnFocus
    };
}
