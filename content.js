let isAltPressed = false;
let isHoveredOverRibbon = false;
let isRibbonOpen = false;
let originalTitle = ''; // Original title for the current tab
let cleanedTitles = new Map(); // Map to store cleaned titles for inactive tabs

// Clean the title (remove the URL portion)
function cleanTitle() {
    if (!originalTitle) originalTitle = document.title; // Cache the original title
    if (!document.title.includes(' - http')) return;

    const cleanedTitle = document.title.replace(/ - https?:\/\/.*/, '');
    console.log('[Title Cleaner] ✨ Title cleaned:', cleanedTitle);
    document.title = cleanedTitle;
}

// Restore the original title
function restoreOriginalTitle() {
    if (!originalTitle) return;

    console.log('[Title Cleaner] ↩️ Title restored to:', originalTitle);
    document.title = originalTitle;
}

// Handle inactive tabs (use cleaned titles)
function handleTabBlur() {
    if (!document.title.includes(' - http')) return;

    // Update the mapping with cleaned title
    const cleanedTitle = document.title.replace(/ - https?:\/\/.*/, '');
    if (!cleanedTitles.has(document.title)) cleanedTitles.set(document.title, cleanedTitle);

    cleanTitle();
}

// Handle active tab (restore original title)
function handleTabFocus() {
    restoreOriginalTitle();
}

// Handle visibility change (tab focus/blur events triggered)
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        console.log('[Title Cleaner] Tab gained focus.');
        handleTabFocus();
    } else {
        console.log('[Title Cleaner] Tab lost focus.');
        handleTabBlur();
    }
}

// ALT key handling
const handleAltKeyPress = async (event) => {
    if (event.key === 'Alt' && !isAltPressed) {
        console.log('[Title Cleaner] 🔑 Alt pressed.');
        isAltPressed = true;
        cleanTitle();
    }
};

const handleAltKeyRelease = async (event) => {
    if (event.key === 'Alt' && isAltPressed) {
        console.log('[Title Cleaner] 🔑 Alt released.');
        isAltPressed = false;
        restoreOriginalTitle();
    }
};

// Ribbon hover handling
const handleRibbonHoverEnter = async () => {
    if (!isHoveredOverRibbon) {
        console.log('[Title Cleaner] 🖱️ Hovering over Ribbon: Cleaning title...');
        isHoveredOverRibbon = true;
        cleanTitle();
    }
};

const handleRibbonHoverLeave = async () => {
    if (isHoveredOverRibbon) {
        console.log('[Title Cleaner] 🖱️ Stopped hovering over Ribbon.');
        isHoveredOverRibbon = false;
        restoreOriginalTitle();
    }
};

// Ribbon open/close handling
const handleRibbonOpen = async () => {
    console.log('[Title Cleaner] 🟢 Ribbon opened.');
    isRibbonOpen = true;
    cleanTitle();
};

const handleRibbonClose = async () => {
    console.log('[Title Cleaner] 🔴 Ribbon closed.');
    isRibbonOpen = false;
    restoreOriginalTitle();
};

// Setup Ribbon hover detection
const retryFindRibbon = () => {
    const ribbonContainer = document.querySelector('#memex-ribbon-container');
    if (!ribbonContainer || !ribbonContainer.shadowRoot) {
        setTimeout(retryFindRibbon, 500);
        return;
    }

    const ribbonHolder = ribbonContainer.shadowRoot.querySelector('#memex-ribbon-holder');
    if (ribbonHolder) {
        console.log('[Title Cleaner] ✅ Ribbon found. Setting up event listeners...');
        ribbonHolder.addEventListener('mouseenter', handleRibbonHoverEnter);
        ribbonHolder.addEventListener('mouseleave', handleRibbonHoverLeave);
    } else {
        setTimeout(retryFindRibbon, 500);
    }
};

// Initialize the script
const initialize = () => {
    console.log('[Title Cleaner] 🚀 Initializing...');

    // Cache the original title if needed
    if (!originalTitle) {
        originalTitle = document.title;
    }

    // Handle tab visibility changes (focus/blur)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add Alt key listeners
    window.addEventListener('keydown', handleAltKeyPress);
    window.addEventListener('keyup', handleAltKeyRelease);

    // Retry finding the Ribbon and setting up interaction listeners
    retryFindRibbon();

    // Restore or clean the title based on the initial tab state
    if (document.visibilityState === 'visible') {
        handleTabFocus();
    } else {
        handleTabBlur();
    }
};

// Start the script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
