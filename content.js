console.log('[Title Cleaner] Script initialized...');

let originalTitle = '';
let isRibbonOpen = false;
let isAltPressed = false;
let browserHasFocus = true;
let ribbonHolder = null;

// Toggle Rize extension
const toggleRize = async (disable) => {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'toggleRize',
            disable: disable
        });

        // Log only if response is valid
        if (response && response.success !== undefined) {
            console.log(`[Title Cleaner] Toggle Rize ${disable ? 'off' : 'on'} ${response.success ? 'succeeded' : 'failed'}`);
        } else {
            console.log(`[Title Cleaner] Toggle Rize ${disable ? 'off' : 'on'}: No success status in response`);
        }
    } catch (error) {
        console.error('[Title Cleaner] Error toggling Rize:', error);
    }
};

// Reset state and cleanup
const resetState = async () => {
    if (isAltPressed) {
        console.log('[Title Cleaner] 🔄 Resetting state...');
        isAltPressed = false;
        await toggleRize(false);
        document.title = originalTitle;
        console.log('[Title Cleaner] ↩️ Title reverted to:', originalTitle);
    }
};

// Handle ribbon state changes
const handleRibbonOpen = async () => {
    if (!isRibbonOpen) {
        originalTitle = document.title;
        console.log('[Title Cleaner] Original title stored:', originalTitle);

        const cleanedTitle = document.title.replace(/ - https?:\/\/.*/, '');
        document.title = cleanedTitle;
        console.log('[Title Cleaner] ✨ Cleaned title to:', cleanedTitle);

        isRibbonOpen = true;

        // Disable Rize when ribbon opens
        await toggleRize(true);
    }
};

const handleRibbonClose = async () => {
    if (isRibbonOpen) {
        document.title = originalTitle;
        console.log('[Title Cleaner] ↩️ Restored original title:', originalTitle);

        isRibbonOpen = false;

        // Re-enable Rize when ribbon closes
        await toggleRize(false);
    }
};

// Detect hover events
const setupHoverDetection = (ribbonHolder) => {
    console.log('[Title Cleaner] Setting up hover detection...');

    const iconContainer = ribbonHolder.querySelector('[class*="IconContainer"]');
    if (!iconContainer) {
        console.error('[Title Cleaner] IconContainer not found inside ribbon holder.');
        return;
    }

    // Add hover listeners
    iconContainer.addEventListener('mouseenter', async () => {
        console.log('[Title Cleaner] 🖱️ Hover entered IconContainer! Disabling Rize...');
        await toggleRize(true);
    });

    iconContainer.addEventListener('mouseleave', async () => {
        console.log('[Title Cleaner] 🖱️ Hover exited IconContainer! Re-enabling Rize...');
        await toggleRize(false);
    });

    console.log('[Title Cleaner] Hover detection initialized.');
};

// Observe ribbon holder for changes
const observeRibbonHolder = (ribbonHolder) => {
    console.log('[Title Cleaner] Starting to observe ribbon holder...');

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(async (node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.className.includes('InnerRibbon')) {
                    console.log('[Title Cleaner] Ribbon opened! Handling...');
                    await handleRibbonOpen();
                }
            });

            mutation.removedNodes.forEach(async (node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.className.includes('InnerRibbon')) {
                    console.log('[Title Cleaner] Ribbon closed! Handling...');
                    await handleRibbonClose();
                }
            });
        });
    });

    observer.observe(ribbonHolder, {
        childList: true,
        subtree: true,
        attributes: true
    });

    setupHoverDetection(ribbonHolder); // Add hover detection to ribbon
    console.log('[Title Cleaner] Observer setup complete.');
};

// Retry detection for ribbon holder in Shadow DOM
const retryFindRibbon = () => {
    console.log('[Title Cleaner] Attempting to find ribbon in shadow DOM...');

    const container = document.querySelector('#memex-ribbon-container');
    if (!container) {
        console.log('❌ Ribbon container not found. Retrying...');
        setTimeout(retryFindRibbon, 500);
        return;
    }

    const shadowRoot = container.shadowRoot;
    if (!shadowRoot) {
        console.log('❌ Shadow root not found. Retrying...');
        setTimeout(retryFindRibbon, 500);
        return;
    }

    const memexRibbon = shadowRoot.querySelector('#memex-ribbon');
    if (!memexRibbon) {
        console.log('❌ Memex ribbon not found in shadow root. Retrying...');
        setTimeout(retryFindRibbon, 500);
        return;
    }

    ribbonHolder = memexRibbon.querySelector('#memex-ribbon-holder');
    if (!ribbonHolder) {
        console.log('❌ Ribbon holder not found in memex ribbon. Retrying...');
        setTimeout(retryFindRibbon, 500);
        return;
    }

    console.log('✅ Ribbon holder found in shadow DOM.');
    observeRibbonHolder(ribbonHolder); // Start observing the ribbon holder
};

// Alt key handling
const handleAltKey = async (event) => {
    if (event.key === 'Alt' && event.code === 'AltLeft' && !isAltPressed) {
        console.log('[Title Cleaner] 🎯 Left Alt key pressed!');

        isAltPressed = true;
        originalTitle = document.title;

        await toggleRize(true);

        const cleanedTitle = document.title.replace(/ - https?:\/\/.*/, '');
        document.title = cleanedTitle;
        console.log('[Title Cleaner] ✨ Title cleaned to:', cleanedTitle);

        event.preventDefault();
    }
};

const handleAltKeyRelease = async (event) => {
    if (event.key === 'Alt' && isAltPressed) {
        console.log('[Title Cleaner] 🔄 Left Alt key released!');
        await resetState();
    }
};

// Window focus/blur handling
const handleWindowBlur = async () => {
    console.log('[Title Cleaner] 👻 Window lost focus');
    browserHasFocus = false;
    await resetState();
};

const handleWindowFocus = () => {
    console.log('[Title Cleaner] 👀 Window regained focus');
    browserHasFocus = true;
};

// Initialize script
const initialize = () => {
    console.log('[Title Cleaner] 🚀 Initializing...');

    window.addEventListener('keydown', handleAltKey);
    window.addEventListener('keyup', handleAltKeyRelease);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    retryFindRibbon(); // Start looking for ribbon holder
    console.log('[Title Cleaner] Initialization complete.');
};

// DOM-ready check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
