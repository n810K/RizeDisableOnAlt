// State variables
let isAltPressed = false;
let isHoveredOverRibbon = false;
let isRibbonOpen = false;
let originalTitle = '';
let browserHasFocus = true;

// Get the URL and append it to the title
const appendURLToTitle = () => {
    if (!originalTitle) originalTitle = document.title;
    const currentURL = window.location.href;
    const updatedTitle = `${originalTitle} - ${currentURL}`;
    document.title = updatedTitle;
    console.log('[Title Cleaner] Title updated:', updatedTitle);
};

// Clean title (remove URL)
const cleanTitle = () => {
    if (originalTitle) {
        document.title = originalTitle;
        console.log('[Title Cleaner] Title cleaned:', originalTitle);
    }
};

// Restore the original title
const restoreOriginalTitle = () => {
    if (originalTitle) {
        document.title = originalTitle;
        console.log('[Title Cleaner] Title restored to:', originalTitle);
    }
};

// Manage title state
const manageRizeState = async () => {
    console.log('[Title Cleaner] State:', {
        isAltPressed,
        isHoveredOverRibbon,
        isRibbonOpen
    });

    if (isAltPressed || isHoveredOverRibbon || isRibbonOpen) {
        console.log('[Title Cleaner] Cleaning title...');
        cleanTitle();
    } else {
        console.log('[Title Cleaner] Appending URL to title...');
        appendURLToTitle();
    }
};

// Handle Alt key press
const handleAltKeyPress = (event) => {
    if (event.key === 'Alt' && !isAltPressed) {
        console.log('[Title Cleaner] Alt key pressed.');
        isAltPressed = true;
        manageRizeState();
    }
};

// Handle Alt key release
const handleAltKeyRelease = (event) => {
    if (event.key === 'Alt' && isAltPressed) {
        console.log('[Title Cleaner] Alt key released.');
        isAltPressed = false;
        manageRizeState();
    }
};

// Handle window blur
const handleBlur = () => {
    console.log('[Title Cleaner] Browser tab lost focus.');
    browserHasFocus = false;
    restoreOriginalTitle();
};

// Handle window focus
const handleFocus = () => {
    console.log('[Title Cleaner] Browser tab regained focus.');
    browserHasFocus = true;
    if (!isAltPressed && !isHoveredOverRibbon && !isRibbonOpen) {
        appendURLToTitle();
    }
};

// Handle ribbon hover enter
const handleRibbonHoverEnter = async () => {
    console.log('[Title Cleaner] Hover enter');
    isHoveredOverRibbon = true;
    manageRizeState();
};

// Handle ribbon hover leave
const handleRibbonHoverLeave = async () => {
    console.log('[Title Cleaner] Hover leave');
    isHoveredOverRibbon = false;
    manageRizeState();
};

// Handle ribbon open
const handleRibbonOpen = async () => {
    console.log('[Title Cleaner] Ribbon opened.');
    isRibbonOpen = true;
    manageRizeState();
};

// Handle ribbon close
const handleRibbonClose = async () => {
    console.log('[Title Cleaner] Ribbon closed.');
    isRibbonOpen = false;
    manageRizeState();
};

// Observe ribbon for hover and open/close events
const observeRibbon = (ribbonHolder) => {
    const iconContainer = ribbonHolder.querySelector('[class*="IconContainer"]');
    
    if (iconContainer) {
        console.log('[Title Cleaner] Setting up hover detection for Ribbon...');
        iconContainer.addEventListener('mouseenter', handleRibbonHoverEnter);
        iconContainer.addEventListener('mouseleave', handleRibbonHoverLeave);
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && 
                    node.className && 
                    node.className.includes('InnerRibbon')) {
                    handleRibbonOpen();
                }
            });
            
            mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && 
                    node.className && 
                    node.className.includes('InnerRibbon')) {
                    handleRibbonClose();
                }
            });
        });
    });

    observer.observe(ribbonHolder, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    console.log('[Title Cleaner] Ribbon observer initialized.');
};

// Retry ribbon detection
const retryFindRibbon = () => {
    console.log('[Title Cleaner] Searching for Ribbon...');
    const ribbonContainer = document.querySelector('#memex-ribbon-container');
    
    if (!ribbonContainer || !ribbonContainer.shadowRoot) {
        setTimeout(retryFindRibbon, 500);
        return;
    }

    const ribbonHolder = ribbonContainer.shadowRoot.querySelector('#memex-ribbon-holder');
    if (ribbonHolder) {
        console.log('[Title Cleaner] Ribbon found. Initializing observation...');
        observeRibbon(ribbonHolder);
    } else {
        setTimeout(retryFindRibbon, 500);
    }
};

// Initialize
const initialize = () => {
    console.log('[Title Cleaner] Initializing...');
    
    // Set up event listeners
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleAltKeyPress);
    window.addEventListener('keyup', handleAltKeyRelease);
    
    // Start looking for the ribbon
    retryFindRibbon();
    
    // Initially append the URL
    appendURLToTitle();
};

// Start the script
initialize();