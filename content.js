// Global state

let currentTitle = ""; 

let lastKnownUrl = ""; 

let isAltPressed = false;

let isHoveredOverRibbon = false;

// Initialize

const initialize = () => {

    setupHistoryHooks();

    setupTitleObserver();

    setupKeyboardShortcuts();

    setupRibbonHover();

    

    // Store initial page state

    const initialState = {

        cleanTitle: document.title,

        url: window.location.href

    };

    history.replaceState(initialState, '', window.location.href);

    currentTitle = document.title;

    lastKnownUrl = window.location.href;

    appendUrlToTitle();

};

// Hook into History API

const setupHistoryHooks = () => {

    const originalPushState = history.pushState;

    const originalReplaceState = history.replaceState;

    history.pushState = function(state, title, url) {

        // Store clean title before navigation

        const newState = {

            cleanTitle: document.title.split(' - http')[0],

            url: url || window.location.href

        };

        originalPushState.call(this, newState, '', url);

        handleUrlChange(url || window.location.href);

    };

    history.replaceState = function(state, title, url) {

        const newState = {

            cleanTitle: document.title.split(' - http')[0],

            url: url || window.location.href

        };

        originalReplaceState.call(this, newState, '', url);

        handleUrlChange(url || window.location.href);

    };

    window.addEventListener('popstate', (event) => {

        if (event.state && event.state.cleanTitle) {

            currentTitle = event.state.cleanTitle;

            handleUrlChange(window.location.href);

        }

    });

};

// Handle URL changes

const handleUrlChange = (newUrl) => {

    if (newUrl !== lastKnownUrl) {

        lastKnownUrl = newUrl;

        

        // Get clean title from history state if available

        const state = history.state || {};

        if (state.cleanTitle) {

            currentTitle = state.cleanTitle;

        }

        

        if (!isAltPressed && !isHoveredOverRibbon) {

            appendUrlToTitle();

        }

    }

};

// Observe title changes

const setupTitleObserver = () => {

    const observer = new MutationObserver(() => {

        const newTitle = document.title;

        if (!newTitle.includes(' - http')) {

            currentTitle = newTitle;

            

            // Update history state with new clean title

            const state = history.state || {};

            state.cleanTitle = currentTitle;

            history.replaceState(state, '', window.location.href);

            

            if (!isAltPressed && !isHoveredOverRibbon) {

                appendUrlToTitle();

            }

        }

    });

    observer.observe(

        document.querySelector('title') || document.head,

        { subtree: true, characterData: true, childList: true }

    );

};

// Append URL to title

const appendUrlToTitle = () => {

    const currentUrl = window.location.href;

    if (!document.title.includes(' - ' + currentUrl)) {

        document.title = `${currentTitle} - ${currentUrl}`;

    }

};

// Reset title

const resetTitle = () => {

    document.title = currentTitle;

};

// Setup keyboard shortcuts

const setupKeyboardShortcuts = () => {

    window.addEventListener('keydown', (event) => {

        if (event.key === 'Alt' && !isAltPressed) {

            isAltPressed = true;

            resetTitle();

        }

    });

    window.addEventListener('keyup', (event) => {

        if (event.key === 'Alt' && isAltPressed) {

            isAltPressed = false;

            appendUrlToTitle();

        }

    });

};

// Setup ribbon hover

const setupRibbonHover = () => {

    const findRibbon = () => {

        const ribbonContainer = document.querySelector("#memex-ribbon-container");

        if (!ribbonContainer || !ribbonContainer.shadowRoot) {

            setTimeout(findRibbon, 500);

            return;

        }

        const ribbonHolder = ribbonContainer.shadowRoot.querySelector("#memex-ribbon-holder");

        if (ribbonHolder) {

            ribbonHolder.addEventListener("mouseenter", () => {

                isHoveredOverRibbon = true;

                resetTitle();

            });

            ribbonHolder.addEventListener("mouseleave", () => {

                isHoveredOverRibbon = false;

                appendUrlToTitle();

            });

        }

    };

    findRibbon();

};

// Start the script

initialize();