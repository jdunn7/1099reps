/**
 * 1099REPS Login Form Handler
 * Handles login form submission and validation
 */

// Import necessary functions
import { signIn, signInWithGoogle, USER_TYPES } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get login form element
    const loginForm = document.getElementById('login-form');
    
    // Add submit event listener to login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Set up social login buttons
    setupSocialLoginButtons();
    
    // Check for redirect parameter in URL
    checkForRedirect();
});

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    // IMPORTANT: Get and store the email value immediately
    const emailInput = document.getElementById('email');
    const emailValue = emailInput ? emailInput.value.trim() : '';
    console.log(`[DEBUG] Email value at start of login: ${emailValue}`);
    
    if (!emailValue) {
        console.error('Email is empty at login form submission start');
        displayErrorMessage('email', 'Email is required');
        return; // Stop submission if email is empty
    }
    
    const passwordInput = document.getElementById('password');
    const rememberMeInput = document.getElementById('remember-me');
    
    // Get password and remember me values
    const password = passwordInput ? passwordInput.value : '';
    const rememberMe = rememberMeInput ? rememberMeInput.checked : false;
    
    // Store the email value in a variable that won't be affected by DOM changes
    const secureEmailValue = emailValue;
    console.log(`[DEBUG] Secure email value: ${secureEmailValue}`);
    
    // Validate form inputs - pass the secure email value
    if (!validateLoginForm(secureEmailValue, password)) {
        // Ensure email field still has its value after validation
        if (emailInput) {
            emailInput.value = secureEmailValue;
        }
        return;
    }
    
    // Double-check email value before proceeding
    console.log(`[DEBUG] Email value before login attempt: ${secureEmailValue}`);
    if (!secureEmailValue) {
        console.error('Email is empty before login attempt');
        displayErrorMessage('email', 'Email is required');
        return;
    }
    
    // Show loading state
    toggleLoadingState(true);
    
    try {
        // Attempt to sign in user with the secure email value
        await signIn(secureEmailValue, password, rememberMe);
        
        // Handle successful login
        handleSuccessfulLogin();
    } catch (error) {
        // Handle login error
        console.error('Login error:', error);
        handleLoginError(error);
        
        // Restore email value after error
        if (emailInput) {
            emailInput.value = secureEmailValue;
        }
    } finally {
        // Hide loading state
        toggleLoadingState(false);
    }
}

/**
 * Validate login form inputs
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {boolean} - True if form is valid
 */
function validateLoginForm(email, password) {
    // Only clear error messages but preserve input values
    resetErrorMessages();
    
    console.log('Validating login form, preserving email value:', email);
    let isValid = true;
    
    // Validate email
    if (!email) {
        displayErrorMessage('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        displayErrorMessage('password', 'Password is required');
        isValid = false;
    }
    
    // Ensure the email input still has its value
    const emailInput = document.getElementById('email');
    if (emailInput && email) {
        emailInput.value = email;
    }
    
    return isValid;
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
    console.log(`[DEBUG] Validating email: ${email}`);
    
    if (!email || email.trim() === '') {
        console.error('Email validation failed: empty email address');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = emailRegex.test(email);
    console.log(`[DEBUG] Email validation result for "${email}": ${result}`);
    return result;
}

/**
 * Display error message for form field
 * @param {string} fieldId - ID of field with error
 * @param {string} message - Error message to display
 */
function displayErrorMessage(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('div');
    
    errorElement.className = 'invalid-feedback';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    field.classList.add('is-invalid');
    
    // Find the closest form-group or input-group-wrapper to append the error message
    const inputGroup = field.closest('.input-group');
    if (inputGroup) {
        // If field is in an input-group, append after the input-group
        inputGroup.parentNode.appendChild(errorElement);
    } else {
        // Otherwise append directly after the field
        field.parentNode.appendChild(errorElement);
    }
}

/**
 * Reset all error messages in form
 */
function resetErrorMessages() {
    console.log('[DEBUG] Resetting error messages');
    
    // First, capture all current input values
    const inputValues = {};
    const formInputs = document.querySelectorAll('input');
    formInputs.forEach(input => {
        if (input.id) {
            inputValues[input.id] = input.value;
            console.log(`[DEBUG] Stored value for ${input.id}: ${inputValues[input.id]}`);
        }
    });
    
    // Remove all invalid-feedback elements
    const errorMessages = document.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(element => element.remove());
    
    // Remove is-invalid class from all inputs
    const invalidInputs = document.querySelectorAll('.is-invalid');
    invalidInputs.forEach(input => input.classList.remove('is-invalid'));
    
    // Restore input values
    formInputs.forEach(input => {
        if (input.id && inputValues[input.id]) {
            input.value = inputValues[input.id];
            console.log(`[DEBUG] Restored value for ${input.id}: ${input.value}`);
        }
    });
    
    console.log('[DEBUG] Reset error messages while preserving input values');
}

/**
 * Toggle loading state of form
 * @param {boolean} isLoading - Whether form is in loading state
 */
function toggleLoadingState(isLoading) {
    const submitButton = document.querySelector('#login-form button[type="submit"]');
    
    if (isLoading) {
        // Disable submit button and show loading indicator
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    } else {
        // Enable submit button and restore original text
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

/**
 * Handle successful login
 */
function handleSuccessfulLogin() {
    // Check if there's a redirect URL in the query parameters
    const redirectUrl = getRedirectUrl();
    
    if (redirectUrl) {
        // Redirect to the specified URL
        window.location.href = redirectUrl;
    } else {
        // Default redirect to dashboard
        window.location.href = 'dashboard/index.html';
    }
}

/**
 * Handle login error
 * @param {Error} error - Login error
 */
function handleLoginError(error) {
    console.error('Login error:', error);
    
    // Display appropriate error message based on error code
    let errorMessage = 'An error occurred during login. Please try again.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
    } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
    }
    
    // Show error alert
    showErrorAlert(errorMessage);
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
    const form = document.getElementById('login-form');
    form.parentNode.insertBefore(alertElement, form);
    
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
    }, 5000);
}

/**
 * Set up social login buttons
 */
function setupSocialLoginButtons() {
    // Get social login buttons
    const googleButton = document.querySelector('button:has(.bi-google)');
    const linkedinButton = document.querySelector('button:has(.bi-linkedin)');
    
    // Add click event listener to Google button
    if (googleButton) {
        googleButton.addEventListener('click', async (event) => {
            event.preventDefault();
            
            try {
                // Show loading state
                toggleLoadingState(true);
                
                // Sign in with Google
                await signInWithGoogle();
                
                // Handle successful login
                handleSuccessfulLogin();
            } catch (error) {
                console.error('Google sign-in error:', error);
                showErrorAlert('An error occurred during Google sign-in. Please try again.');
            } finally {
                // Hide loading state
                toggleLoadingState(false);
            }
        });
    }
    
    // Add click event listener to LinkedIn button
    if (linkedinButton) {
        linkedinButton.addEventListener('click', async (event) => {
            event.preventDefault();
            
            try {
                // Show loading state
                toggleLoadingState(true);
                
                // Sign in with LinkedIn
                await signInWithLinkedIn();
                
                // Handle successful login
                handleSuccessfulLogin();
            } catch (error) {
                console.error('LinkedIn sign-in error:', error);
                showErrorAlert('An error occurred during LinkedIn sign-in. Please try again.');
            } finally {
                // Hide loading state
                toggleLoadingState(false);
            }
        });
    }
}

/**
 * Get redirect URL from query parameters
 * @returns {string|null} - Redirect URL or null if not present
 */
function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect');
}

/**
 * Check for redirect parameter in URL
 */
function checkForRedirect() {
    const redirectUrl = getRedirectUrl();
    
    if (redirectUrl) {
        // Display message about redirect
        const messageElement = document.createElement('div');
        messageElement.className = 'alert alert-info mt-3';
        messageElement.textContent = 'Please log in to continue to the requested page.';
        
        // Insert message before form
        const form = document.getElementById('login-form');
        form.parentNode.insertBefore(messageElement, form);
    }
}
