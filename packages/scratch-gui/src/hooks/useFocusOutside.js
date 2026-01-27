import {useEffect, useRef} from 'react';

/**
 * Custom hook that detects focus moving outside of the given container
 * and popover elements and calls onClose when that happens.
 *
 * Useful for closing modals, popovers, or dropdowns when focus leaves
 * their interactive area (e.g. via keyboard navigation).
 * @param {() => void} onClose
 * Closing popover function when focus moves outside both the container and popover.
 * @returns {object}
 * - containerRef: reference to the container of the element that activates the popover,
 * - popoverRef: reference to be attached to popover
 * }}
 */
export default function useFocusOutside (onClose) {
    const containerRef = useRef(null);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleFocusIn = event => {
            const target = event.target;
            if (
                (containerRef.current && containerRef.current.contains(target)) ||
                (popoverRef.current && popoverRef.current.contains(target))
            ) {
                return;
            }

            onClose();
        };

        document.addEventListener('focusin', handleFocusIn);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [containerRef, onClose]);

    return {containerRef, popoverRef};
}
