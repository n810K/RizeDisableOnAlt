// Global state
let originalTitle = document.title;
let isAltPressed = false;
let isHoveredOverRibbon = false;

// Initialize
const initialize = () => {
    // Save initial clean title
    originalTitle = document.title;

    // Set up event listeners
    window.addEventListener('keydown', handleAltKeyPress);
    window.addEventListener('keyup', handleAltKeyRelease);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    // Handle navigation
    const observer = new MutationObserver(() => {
        originalTitle = document.title.split(' - ')[0];
        if (!isAltPressed && !isHoveredOverRibbon) {
            appendUrlToTitle();
        }
    });
    
    observer.observe(document.querySelector('title') || document.head, {
        subtree: true,
        characterData: true,
        childList: true
    });

    // Find and set up ribbon
    retryFindRibbon();

    // Initial URL append
    appendUrlToTitle();
};

// Core title functions
const appendUrlToTitle = () => {
    const currentUrl = window.location.href;
    if (!document.title.includes(' - ' + currentUrl)) {
        document.title = `${originalTitle} - ${currentUrl}`;
    }
};

const resetTitle = () => {
    document.title = originalTitle;
};

// Event handlers
const handleAltKeyPress = (event) => {
    if (event.key === 'Alt' && !isAltPressed) {
        isAltPressed = true;
        resetTitle();
    }
};

const handleAltKeyRelease = (event) => {
    if (event.key === 'Alt' && isAltPressed) {
        isAltPressed = false;
        appendUrlToTitle();
    }
};

const handleWindowBlur = () => {
    resetTitle();
};

const handleWindowFocus = () => {
    appendUrlToTitle();
};

// Ribbon functionality
const retryFindRibbon = () => {
    const ribbonContainer = document.querySelector('#memex-ribbon-container');
    if (!ribbonContainer || !ribbonContainer.shadowRoot) {
        setTimeout(retryFindRibbon, 500);
        return;
    }

    const ribbonHolder = ribbonContainer.shadowRoot.querySelector('#memex-ribbon-holder');
    if (ribbonHolder) {
        ribbonHolder.addEventListener('mouseenter', () => {
            isHoveredOverRibbon = true;
            resetTitle();
        });

        ribbonHolder.addEventListener('mouseleave', () => {
            isHoveredOverRibbon = false;
            appendUrlToTitle();
        });
    }
};

// Start
initialize();
