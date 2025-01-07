// Store Rize's extension ID
let rizeExtensionId = null;

// Find Rize's extension ID
chrome.management.getAll(function(extensions) {
    const rize = extensions.find(ext => ext.name.toLowerCase().includes('rize'));
    if (rize) {
        rizeExtensionId = rize.id;
        console.log('[Title Cleaner] Found Rize extension:', rize.id);
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleRize') {
        if (rizeExtensionId) {
            chrome.management.setEnabled(rizeExtensionId, !request.disable, () => {
                console.log(`[Title Cleaner] Rize ${request.disable ? 'disabled' : 'enabled'}`);
                sendResponse({ success: true });
            });
            return true; // Keep the message channel open for async response
        } else {
            console.log('[Title Cleaner] Rize extension not found');
            sendResponse({ success: false });
        }
    }
});
