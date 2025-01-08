let isAltPressed = false; // Tracks if Alt key is being pressed
let isHoveredOverRibbon = false; // Tracks if hovering over the ribbon
let isRibbonOpen = false; // Tracks if the ribbon is open
let originalTitle = ''; // Stores the original title before cleaning

// Function to toggle the Rize extension
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

// Function to clean the title
const cleanTitle = () => {
    if (!originalTitle) originalTitle = document.title; // Save original title only once
    const cleanedTitle = originalTitle.replace(/ - https?:\/\/.*/, ''); // Remove added URL
    document.title = cleanedTitle;
    console.log('[Title Cleaner] ✨ Title cleaned to:', cleanedTitle);
};

// Function to restore the original title
const restoreOriginalTitle = () => {
    if (originalTitle) {
        document.title = originalTitle; // Restore the original title
        console.log('[Title Cleaner] ↩️ Title restored to:', originalTitle);
    }
};

// Unified function to manage Rize state
const manageRizeState = async () => {
    if (isAltPressed || isHoveredOverRibbon || isRibbonOpen) {
        // Disable Rize when ANY condition is active
        console.log('[Title Cleaner] 🚨 Disabling Rize (Active condition: Alt/Hover/Ribbon Open)');
        await toggleRize(true);
        cleanTitle();
    } else {
        // Re-enable Rize ONLY when ALL conditions are cleared
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
        manageRizeState(); // Trigger disable due to Alt key press
    }

    // Ensure pressing any other key while holding Alt doesn't interfere
    if (isAltPressed) {
        console.log(`[Title Cleaner] 🖱️ Holding Alt + ${event.key}`);
        event.preventDefault(); // Prevent default Alt+key interactions if needed
    }
};

// Handle Alt key release
const handleAltKeyRelease = async (event) => {
    if (event.key === 'Alt' && isAltPressed) {
        console.log('[Title Cleaner] 🔑 Alt released.');
        isAltPressed = false;
        manageRizeState(); // Re-enable if no other conditions are active
    }
};

// Handle ribbon hover enter
const handleRibbonHoverEnter = async () => {
    if (!isHoveredOverRibbon) {
        console.log('[Title Cleaner] 🖱️ Hovering over Ribbon: Disabling Rize...');
        isHoveredOverRibbon = true; // Set hover state to true
        manageRizeState(); // Trigger Rize disable
    }
};

// Handle ribbon hover leave
const handleRibbonHoverLeave = async () => {
    if (isHoveredOverRibbon) {
        console.log('[Title Cleaner] 🖱️ Stopped hovering over Ribbon.');
        isHoveredOverRibbon = false; // Set hover state to false
        manageRizeState(); // Re-enable if no other conditions are active
    }
};

// Handle ribbon open (e.g., clicking on ribbon)
const handleRibbonOpen = async () => {
    console.log('[Title Cleaner] 🟢 Ribbon opened.');
    isRibbonOpen = true; // Set ribbon open state
    manageRizeState(); // Trigger Rize disable
};

// Handle ribbon close
const handleRibbonClose = async () => {
    console.log('[Title Cleaner] 🔴 Ribbon closed.');
    isRibbonOpen = false; // Clear ribbon open state
    manageRizeState(); // Re-enable if no other conditions are active
};

// Observe the ribbon holder for hover and open/close events
const observeRibbon = (ribbonHolder) => {
    // Observe for ribbon hover events
    const iconContainer = ribbonHolder.querySelector('[class*="IconContainer"]');
    if (iconContainer) {
        console.log('[Title Cleaner] 🖱️ Setting up hover detection for Ribbon...');
        iconContainer.addEventListener('mouseenter', handleRibbonHoverEnter);
        iconContainer.addEventListener('mouseleave', handleRibbonHoverLeave);
    }

    // Observe for ribbon open/close events
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.className.includes('InnerRibbon')) {
                    handleRibbonOpen(); // Trigger when ribbon opens
                }
            });
            mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.className.includes('InnerRibbon')) {
                    handleRibbonClose(); // Trigger when ribbon closes
                }
            });
        });
    });

    observer.observe(ribbonHolder, { childList: true, subtree: true });
};

// Retry ribbon detection if not immediately available
const retryFindRibbon = () => {
    console.log('[Title Cleaner] 🔍 Searching for Ribbon...');
    const ribbonContainer = document.querySelector('#memex-ribbon-container');
    if (!ribbonContainer || !ribbonContainer.shadowRoot) {
        setTimeout(retryFindRibbon, 500); // Retry after 500ms
        return;
    }

    const ribbonHolder = ribbonContainer.shadowRoot.querySelector('#memex-ribbon-holder');
    if (ribbonHolder) {
        console.log('[Title Cleaner] ✅ Ribbon found. Initializing observation...');
        observeRibbon(ribbonHolder); // Attach hover and click observers
    } else {
        setTimeout(retryFindRibbon, 500); // Retry if ribbon holder not found
    }
};

// Initialize the extension functionality
const initialize = () => {
    console.log('[Title Cleaner] 🚀 Initializing...');
    // Add event listeners for Alt key
    window.addEventListener('keydown', handleAltKeyPress);
    window.addEventListener('keyup', handleAltKeyRelease);

    // Start looking for ribbon
    retryFindRibbon();
};

// Start the script
initialize();
