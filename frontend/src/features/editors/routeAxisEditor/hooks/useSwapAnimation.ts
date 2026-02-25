import { useState } from 'react';

interface SwapAnimation {
    movedId: string;
    displacedId: string;
    direction: 'up' | 'down';
}

export const useSwapAnimation = () => {
    const [activeSwap, setActiveSwap] = useState<SwapAnimation | null>(null);

    const triggerSwap = (movedId: string, displacedId: string, direction: 'up' | 'down') => {
        setActiveSwap({ movedId, displacedId, direction });
        setTimeout(() => setActiveSwap(null), 350);
    };

    const getSwapCssClass = (id: string): string => {
        if (!activeSwap) return '';
        if (activeSwap.movedId === id) {
            return activeSwap.direction === 'up' ? 'route-axis-editor-swap-down' : 'route-axis-editor-swap-up';
        }
        if (activeSwap.displacedId === id) {
            return activeSwap.direction === 'up' ? 'route-axis-editor-swap-up' : 'route-axis-editor-swap-down';
        }
        return '';
    };

    return { triggerSwap, getSwapCssClass };
};
