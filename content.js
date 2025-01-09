// Global variables for managing state
let originalTitle = document.title; // Base title of the page (saved initially)
let isAltPressed = false; // Tracks whether the Alt key is pressed
let isHoveredOverRibbon = false; // Tracks whether the ribbon is being hovered

// Initialize the script
const initialize = () => {
    console.log('[Title Handler] Initializing Alt + Ribbon functionality...');
    originalTitle = document.title; // Save the clean original title
    setupAltKeyHandling(); // Handle Alt key behavior
    setupRibbonHoverListeners(); // Handle Ribbon hover behavior
    appendUrlToTitle(); // Automatically apply "Title - URL" on page load
};

// ==== Title Management ====

/**
 * Appends "- URL" to the current page title if not already done.
 */
const appendUrlToTitle = () => {
    const currentUrl = window.location.href;

    // Avoid re-appending if already in "Title - URL" format
    if (!document.title.includes(` - ${currentUrl}`)) {
        document.title = `${originalTitle} - ${currentUrl}`;
        console.log('[Title Handler] Appended URL to title:', document.title);
    }
};

/**
 * Resets the title to its original, clean version (without "- URL").
 */
const resetTitleToOriginal = () => {
    if (document.title !== originalTitle) {
        document.title = originalTitle;
        console.log('[Title Handler] Title reset to original:', originalTitle);
    }
};

/**
 * Restores the title to "Title - URL" format after resets.
 */
const restoreTitleToAppended = () => {
    appendUrlToTitle(); // Reapply the URL logic when restoring
};

// ==== Alt Key Functionality ====

/**
 * Handles Alt key presses to reset and restore the title.
 */
const setupAltKeyHandling = () => {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Alt' && !isAltPressed) {
            isAltPressed = true;
            console.log('[Title Handler] Alt key pressed. Resetting title...');
            resetTitleToOriginal(); // Reset the title to the original clean version.
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'Alt' && isAltPressed) {
            isAltPressed = false;
            console.log('[Title Handler] Alt key released. Restoring title...');
            restoreTitleToAppended(); // Restore the title back to "Title - URL".
        }
    });
};

// ==== Ribbon Hover Functionality ====

/**
 * Handles ribbon hover events to reset and restore the title.
 */
const setupRibbonHoverListeners = () => {
    const retryFindRibbon = () => {
        const ribbonContainer = document.querySelector('#memex-ribbon-container');
        
        // Retry if the ribbon container or shadow DOM isn't ready yet
        if (!ribbonContainer || !ribbonContainer.shadowRoot) {
            setTimeout(retryFindRibbon, 500); // Retry every 500ms
            return;
        }

        const ribbonHolder = ribbonContainer.shadowRoot.querySelector('#memex-ribbon-holder');
        if (ribbonHolder) {
            console.log('[Title Handler] Ribbon found. Adding hover listeners...');

            // Hover starts: Reset the title
            ribbonHolder.addEventListener('mouseenter', () => {
                if (!isHoveredOverRibbon) {
                    isHoveredOverRibbon = true;
                    console.log('[Title Handler] Ribbon hovered. Resetting title...');
                    resetTitleToOriginal();
                }
            });

            // Hover ends: Restore the title
            ribbonHolder.addEventListener('mouseleave', () => {
                if (isHoveredOverRibbon) {
                    isHoveredOverRibbon = false;
                    console.log('[Title Handler] Ribbon hover ended. Restoring title...');
                    restoreTitleToAppended();
                }
            });
        }
    };

    retryFindRibbon();
};

// Start the script
initialize();
