/**
 * 1099REPS Onboarding Handler
 * Handles onboarding process for new users
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!window.authModule.isAuthenticated()) {
        // Redirect to login page if not authenticated
        window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }
    
    // Initialize onboarding
    initializeOnboarding();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize onboarding with user data
 */
async function initializeOnboarding() {
    try {
        // Get current user
        const user = window.authModule.getCurrentUser();
        
        if (!user) {
            console.error('No user found');
            return;
        }
        
        // Get user data from Firestore
        const userData = await getUserData(user.uid);
        
        if (!userData) {
            console.error('No user data found');
            return;
        }
        
        // Update UI with user data
        updateOnboardingUI(userData);
    } catch (error) {
        console.error('Error initializing onboarding:', error);
        showErrorAlert('Error loading user data. Please refresh the page.');
    }
}

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
async function getUserData(userId) {
    try {
        // Get user document from Firestore
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            throw new Error('User document not found');
        }
        
        const userData = userDoc.data();
        
        // Get additional data based on user type
        const collection = userData.userType === 'rep' ? 'reps' : 'companies';
        const profileDoc = await firebase.firestore().collection(collection).doc(userId).get();
        
        if (!profileDoc.exists) {
            throw new Error('Profile document not found');
        }
        
        // Combine user and profile data
        return {
            ...userData,
            profile: profileDoc.data()
        };
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
}

/**
 * Update onboarding UI with user data
 * @param {Object} userData - User data
 */
function updateOnboardingUI(userData) {
    // Update user name in welcome message
    const welcomeMessage = document.querySelector('.onboarding-main h1');
    if (welcomeMessage) {
        let displayName = 'there';
        
        if (userData.userType === 'rep') {
            displayName = userData.profile.firstName || displayName;
            welcomeMessage.textContent = `Welcome to 1099 REPS, ${displayName}!`;
        } else if (userData.userType === 'company') {
            displayName = userData.profile.companyName || displayName;
            welcomeMessage.textContent = `Welcome to 1099 REPS, ${displayName}!`;
        }
    }
    
    // Update user avatar and name in navbar
    const userAvatar = document.querySelector('#userDropdown img');
    const userName = document.querySelector('#userDropdown span');
    
    if (userAvatar && userName) {
        // Set user name
        if (userData.userType === 'rep') {
            userName.textContent = `${userData.profile.firstName} ${userData.profile.lastName}`;
        } else if (userData.userType === 'company') {
            userName.textContent = userData.profile.companyName;
        }
        
        // Set user avatar if available
        if (userData.profile.avatarUrl) {
            userAvatar.src = userData.profile.avatarUrl;
        }
    }
    
    // Show appropriate form based on user type
    if (userData.userType === 'rep') {
        document.getElementById('rep-form').style.display = 'block';
    } else if (userData.userType === 'company') {
        // If we had a company form, we would show it here
        // For now, redirect to dashboard
        window.location.href = '../dashboard/index.html';
    }
    
    // Pre-fill form fields if data exists
    if (userData.userType === 'rep') {
        const profile = userData.profile;
        
        // Pre-fill phone number
        const phoneInput = document.getElementById('phone');
        if (phoneInput && profile.phone) {
            phoneInput.value = profile.phone;
        }
        
        // Pre-fill bio
        const bioInput = document.getElementById('bio');
        if (bioInput && profile.bio) {
            bioInput.value = profile.bio;
        }
        
        // Pre-fill LinkedIn profile
        const linkedinInput = document.getElementById('linkedin');
        if (linkedinInput && profile.linkedin) {
            linkedinInput.value = profile.linkedin;
        }
        
        // Pre-fill website
        const websiteInput = document.getElementById('website');
        if (websiteInput && profile.website) {
            websiteInput.value = profile.website;
        }
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Set up next button
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', handleNextButtonClick);
    }
    
    // Set up skip button
    const skipButton = document.getElementById('skip-button');
    if (skipButton) {
        skipButton.addEventListener('click', handleSkipButtonClick);
    }
    
    // Set up logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
    
    // Set up profile photo upload
    const profilePhotoInput = document.getElementById('profile-photo');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', handleProfilePhotoChange);
    }
}

/**
 * Handle next button click
 * @param {Event} event - Click event
 */
async function handleNextButtonClick(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateOnboardingForm()) {
        return;
    }
    
    // Show loading state
    toggleLoadingState(true);
    
    try {
        // Get form data
        const formData = getFormData();
        
        // Get current user
        const user = window.authModule.getCurrentUser();
        
        if (!user) {
            throw new Error('No user found');
        }
        
        // Get user type from Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            throw new Error('User document not found');
        }
        
        const userData = userDoc.data();
        const userType = userData.userType;
        
        // Update user profile
        await window.authModule.updateUserProfile(user.uid, userType, formData);
        
        // Redirect to dashboard
        window.location.href = '../dashboard/index.html';
    } catch (error) {
        console.error('Error updating profile:', error);
        showErrorAlert('Error updating profile. Please try again.');
    } finally {
        // Hide loading state
        toggleLoadingState(false);
    }
}

/**
 * Handle skip button click
 * @param {Event} event - Click event
 */
function handleSkipButtonClick(event) {
    event.preventDefault();
    
    // Confirm skip
    if (confirm('Are you sure you want to skip this step? Completing your profile will help you get more job matches.')) {
        // Redirect to dashboard
        window.location.href = '../dashboard/index.html';
    }
}

/**
 * Handle logout button click
 * @param {Event} event - Click event
 */
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        // Sign out user
        await window.authModule.signOut();
        
        // Redirect to home page
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showErrorAlert('Error signing out. Please try again.');
    }
}

/**
 * Handle profile photo change
 * @param {Event} event - Change event
 */
function handleProfilePhotoChange(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Check file type
        if (!file.type.match('image.*')) {
            showErrorAlert('Please select an image file.');
            event.target.value = '';
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showErrorAlert('Please select an image smaller than 5MB.');
            event.target.value = '';
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewImage = document.querySelector('.profile-photo-preview img');
            if (previewImage) {
                previewImage.src = e.target.result;
            }
        };
        
        reader.readAsDataURL(file);
    }
}

/**
 * Validate onboarding form
 * @returns {boolean} - True if form is valid
 */
function validateOnboardingForm() {
    // Reset previous error messages
    resetErrorMessages();
    
    let isValid = true;
    
    // Validate phone
    const phoneInput = document.getElementById('phone');
    if (phoneInput && !phoneInput.value.trim()) {
        displayErrorMessage('phone', 'Phone number is required');
        isValid = false;
    }
    
    // Validate bio
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        const bioValue = bioInput.value.trim();
        
        if (!bioValue) {
            displayErrorMessage('bio', 'Professional bio is required');
            isValid = false;
        } else if (bioValue.length < 100) {
            displayErrorMessage('bio', 'Bio must be at least 100 characters');
            isValid = false;
        }
    }
    
    // Validate LinkedIn URL (if provided)
    const linkedinInput = document.getElementById('linkedin');
    if (linkedinInput && linkedinInput.value.trim() && !isValidUrl(linkedinInput.value.trim())) {
        displayErrorMessage('linkedin', 'Please enter a valid URL');
        isValid = false;
    }
    
    // Validate website URL (if provided)
    const websiteInput = document.getElementById('website');
    if (websiteInput && websiteInput.value.trim() && !isValidUrl(websiteInput.value.trim())) {
        displayErrorMessage('website', 'Please enter a valid URL');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Get form data
 * @returns {Object} - Form data
 */
function getFormData() {
    const formData = {};
    
    // Get phone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        formData.phone = phoneInput.value.trim();
    }
    
    // Get bio
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        formData.bio = bioInput.value.trim();
    }
    
    // Get LinkedIn profile
    const linkedinInput = document.getElementById('linkedin');
    if (linkedinInput && linkedinInput.value.trim()) {
        formData.linkedin = linkedinInput.value.trim();
    }
    
    // Get website
    const websiteInput = document.getElementById('website');
    if (websiteInput && websiteInput.value.trim()) {
        formData.website = websiteInput.value.trim();
    }
    
    // Set profile completion status
    formData.profileCompleted = true;
    
    return formData;
}

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Display error message for form field
 * @param {string} fieldId - ID of field with error
 * @param {string} message - Error message to display
 */
function displayErrorMessage(fieldId, message) {
    const field = document.getElementById(fieldId);
    
    if (field) {
        const errorElement = document.createElement('div');
        
        errorElement.className = 'invalid-feedback';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        field.classList.add('is-invalid');
        
        // For checkbox fields, append to parent div
        if (field.type === 'checkbox') {
            field.closest('.form-check').appendChild(errorElement);
        } else {
            field.parentNode.appendChild(errorElement);
        }
    }
}

/**
 * Reset all error messages in form
 */
function resetErrorMessages() {
    // Remove all invalid-feedback elements
    const errorMessages = document.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(element => element.remove());
    
    // Remove is-invalid class from all inputs
    const invalidInputs = document.querySelectorAll('.is-invalid');
    invalidInputs.forEach(input => input.classList.remove('is-invalid'));
}

/**
 * Toggle loading state of form
 * @param {boolean} isLoading - Whether form is in loading state
 */
function toggleLoadingState(isLoading) {
    const nextButton = document.getElementById('next-button');
    const skipButton = document.getElementById('skip-button');
    
    if (isLoading) {
        // Disable buttons and show loading indicator
        if (nextButton) {
            nextButton.disabled = true;
            nextButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        }
        
        if (skipButton) {
            skipButton.disabled = true;
        }
    } else {
        // Enable buttons and restore original text
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.textContent = 'Continue';
        }
        
        if (skipButton) {
            skipButton.disabled = false;
        }
    }
}

/**
 * Show error alert
 * @param {string} message - Error message to display
 */
function showErrorAlert(message) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alertElement.role = 'alert';
    
    // Add alert content
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert alert before form
    const form = document.getElementById('onboarding-form');
    form.parentNode.insertBefore(alertElement, form);
    
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
    }, 5000);
}
