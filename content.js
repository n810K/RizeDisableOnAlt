// Global state
let originalTitle = ""; // This will dynamically track the "real" title.
let isAltPressed = false;
let isHoveredOverRibbon = false;

// Initialize
const initialize = () => {
    // Delay saving the initial title to wait for potential dynamic title changes
    setTimeout(() => {
        originalTitle = document.title; // Capture the final dynamic title the site sets
    }, 50); // 50ms delay (adjust if needed for slower sites)

    // Set up event listeners
    window.addEventListener('keydown', handleAltKeyPress);
    window.addEventListener('keyup', handleAltKeyRelease);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Watch for navigation/title changes
    const observer = new MutationObserver(() => {
        // Capture the dynamic title set by the site (before making any changes)
        if (!document.title.includes(' - ')) {
            originalTitle = document.title; // Safeguard dynamic title
        }

        // Ensure we append the URL correctly if conditions are met
        if (!isAltPressed && !isHoveredOverRibbon) {
            handleDelayedUrlAppend();
        }
    });
    observer.observe(document.querySelector('title') || document.head, {
        subtree: true,
        characterData: true,
        childList: true,
    });

    // Initial delayed URL append
    handleDelayedUrlAppend();

    // Retry ribbon setup
    retryFindRibbon();
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

// Delayed URL append (after page is added to history)
const handleDelayedUrlAppend = () => {
    // Small timeout to ensure that the page is in browser history
    setTimeout(() => {
        if (!isAltPressed && !isHoveredOverRibbon) {
            appendUrlToTitle();
        }
    }, 250); // Delay can be adjusted if the appending is too early
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
    handleDelayedUrlAppend();
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
            handleDelayedUrlAppend();
        });
    }
};

// Start
initialize();
