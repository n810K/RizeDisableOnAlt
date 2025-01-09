let isAltPressed = false;
let isHoveredOverRibbon = false;
let isRibbonOpen = false;
let originalTitle = '';
let browserHasFocus = true;

// Toggle Rize extension
const toggleRize = async (disable) => {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'toggleRize',
            disable: disable
        });
        console.log(`[Title Cleaner] Rize ${disable ? 'disabled' : 'enabled'}: `, response.success);
    } catch (error) {
        console.error('[Title Cleaner] Error toggling Rize:', error);
    }
};

// Clean the title
const cleanTitle = () => {
    if (!originalTitle) originalTitle = document.title;
    const cleanedTitle = document.title.replace(/ - https?:\/\/.*/, '');
    document.title = cleanedTitle;
    console.log('[Title Cleaner] ✨ Title cleaned to:', cleanedTitle);
};

// Restore the original title
const restoreOriginalTitle = () => {
    if (originalTitle) {
        document.title = originalTitle;
        console.log('[Title Cleaner] ↩️ Title restored to:', originalTitle);
    }
};

// Reset state and cleanup
const resetState = async () => {
    if (isAltPressed) {
        console.log('[Title Cleaner] 🔄 Resetting state...');
        isAltPressed = false;
        await toggleRize(false);
        restoreOriginalTitle();
    }
};

// Manage Rize state
const manageRizeState = async () => {
    if (isAltPressed || isHoveredOverRibbon || isRibbonOpen) {
        console.log('[Title Cleaner] 🚨 Disabling Rize (Active condition: Alt/Hover/Ribbon Open)');
        await toggleRize(true);
        cleanTitle();
    } else {
        console.log('[Title Cleaner] ✅ Enabling Rize (No active conditions)');
        await toggleRize(false);
        restoreOriginalTitle();
    }
};

// Handle Alt key press
const handleAltKeyPress = async (event) => {
    if (event.key === 'Alt' && !isAltPressed) {
        console.log('[Title Cleaner] 🔑 Alt pressed.');
        isAltPressed = true;
        manageRizeState();
    }

    if (isAltPressed) {
        console.log(`[Title Cleaner] 🖱️ Holding Alt + ${event.key}`);
        event.preventDefault();
    }
};

// Handle Alt key release
const handleAltKeyRelease = async (event) => {
    if (event.key === 'Alt' && isAltPressed) {
        console.log('[Title Cleaner] 🔑 Alt released.');
        isAltPressed = false;
        manageRizeState();
    }
};

// Handle window blur (losing focus)
const handleWindowBlur = async () => {
    console.log('[Title Cleaner] 👻 Window lost focus');
    browserHasFocus = false;
    await resetState();
};

// Handle window focus
const handleWindowFocus = () => {
    console.log('[Title Cleaner] 👀 Window regained focus');
    browserHasFocus = true;
};

// Handle ribbon hover enter
const handleRibbonHoverEnter = async () => {
    if (!isHoveredOverRibbon) {
        console.log('[Title Cleaner] 🖱️ Hovering over Ribbon: Disabling Rize...');
        isHoveredOverRibbon = true;
        manageRizeState();
    }
};

// Handle ribbon hover leave
const handleRibbonHoverLeave = async () => {
    if (isHoveredOverRibbon) {
        console.log('[Title Cleaner] 🖱️ Stopped hovering over Ribbon.');
        isHoveredOverRibbon = false;
        manageRizeState();
    }
};

// Handle ribbon open
const handleRibbonOpen = async () => {
    console.log('[Title Cleaner] 🟢 Ribbon opened.');
    isRibbonOpen = true;
    manageRizeState();
};

// Handle ribbon close
const handleRibbonClose = async () => {
    console.log('[Title Cleaner] 🔴 Ribbon closed.');
    isRibbonOpen = false;
    manageRizeState();
};

// Observe ribbon for hover and open/close events
const observeRibbon = (ribbonHolder) => {
    const iconContainer = ribbonHolder.querySelector('[class*="IconContainer"]');
    if (iconContainer) {
        console.log('[Title Cleaner] 🖱️ Setting up hover detection for Ribbon...');
        iconContainer.addEventListener('mouseenter', handleRibbonHoverEnter);
        iconContainer.addEventListener('mouseleave', handleRibbonHoverLeave);
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.className.includes('InnerRibbon')) {
                    handleRibbonOpen();
                }
            });
            mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.className.includes('InnerRibbon')) {
                    handleRibbonClose();
                }
            });
        });
    });

    observer.observe(ribbonHolder, { childList: true, subtree: true });
};

// Retry ribbon detection
const retryFindRibbon = () => {
    console.log('[Title Cleaner] 🔍 Searching for Ribbon...');
    const ribbonContainer = document.querySelector('#memex-ribbon-container');
    if (!ribbonContainer || !ribbonContainer.shadowRoot) {
        setTimeout(retryFindRibbon, 500);
        return;
    }

    const ribbonHolder = ribbonContainer.shadowRoot.querySelector('#memex-ribbon-holder');
    if (ribbonHolder) {
        console.log('[Title Cleaner] ✅ Ribbon found. Initializing observation...');
        observeRibbon(ribbonHolder);
    } else {
        setTimeout(retryFindRibbon, 500);
    }
};

// Initialize
const initialize = () => {
    console.log('[Title Cleaner] 🚀 Initializing...');
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleAltKeyPress);
    window.addEventListener('keyup', handleAltKeyRelease);
    retryFindRibbon();
};

// Start the script
initialize();