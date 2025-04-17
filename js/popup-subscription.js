/**
 * 1099REPS Subscription Popup
 * Shows a subscription popup after 10 seconds for new visitors
 * Uses IP address and localStorage to ensure it only shows once per visitor
 */

// Configuration
const POPUP_DELAY = 10000; // 10 seconds
const POPUP_COOKIE_NAME = 'popup_shown';
const POPUP_COOKIE_DURATION = 30; // days
const EXCLUDED_IPS = [
    '127.0.0.1',  // localhost
    '::1'         // localhost IPv6
    // Add any other IPs you want to exclude
];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should show the popup
    if (!hasPopupBeenShown()) {
        // Get visitor's IP address
        getVisitorIP().then(ip => {
            // If IP is not in excluded list, show popup after delay
            if (!EXCLUDED_IPS.includes(ip)) {
                setTimeout(showPopup, POPUP_DELAY);
            }
        }).catch(error => {
            console.error('Error getting IP address:', error);
            // If we can't get the IP, still show popup based on cookie
            setTimeout(showPopup, POPUP_DELAY);
        });
    }
    
    // Add event listeners for popup
    setupPopupEventListeners();
});

/**
 * Check if popup has been shown before
 * @returns {boolean} True if popup has been shown before
 */
function hasPopupBeenShown() {
    return localStorage.getItem(POPUP_COOKIE_NAME) === 'true';
}

/**
 * Mark popup as shown
 */
function markPopupAsShown() {
    localStorage.setItem(POPUP_COOKIE_NAME, 'true');
    
    // Also set a cookie as backup
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + POPUP_COOKIE_DURATION);
    document.cookie = `${POPUP_COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;
}

/**
 * Get visitor's IP address using a free API
 * @returns {Promise<string>} Promise that resolves to IP address
 */
function getVisitorIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip);
}

/**
 * Show the popup
 */
function showPopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) {
        popupOverlay.classList.add('show');
        markPopupAsShown();
    }
}

/**
 * Hide the popup
 */
function hidePopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) {
        popupOverlay.classList.remove('show');
    }
}

/**
 * Set up event listeners for popup
 */
function setupPopupEventListeners() {
    // Close button
    const closeButton = document.getElementById('popup-close');
    if (closeButton) {
        closeButton.addEventListener('click', hidePopup);
    }
    
    // Close when clicking outside
    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) {
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                hidePopup();
            }
        });
    }
    
    // Form submission
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('popup-email').value;
            if (email) {
                // In a real implementation, you would send this to your server or email service
                console.log('Subscription email:', email);
                
                // Show success message
                const formContainer = document.getElementById('popup-form-container');
                const successMessage = document.getElementById('popup-success');
                
                if (formContainer && successMessage) {
                    formContainer.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    // Close popup after delay
                    setTimeout(hidePopup, 3000);
                }
            }
        });
    }
    
    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hidePopup();
        }
    });
}
