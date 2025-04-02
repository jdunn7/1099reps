/**
 * 1099REPS Signup Form Handler
 * Handles signup form submission and validation for both reps and companies
 */

// Import auth module and necessary functions
import { authModule, signUp, USER_TYPES } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded - initializing signup forms');
    
    // Get signup forms
    const repSignupForm = document.getElementById('rep-signup-form');
    const companySignupForm = document.getElementById('company-signup-form');
    
    // Direct access to form fields for validation
    const repEmailInput = document.getElementById('rep-email');
    const repEmailFeedback = document.getElementById('rep-email-feedback');
    const repPasswordInput = document.getElementById('rep-password');
    const repConfirmPasswordInput = document.getElementById('rep-confirm-password');
    
    // Set up real-time email validation
    if (repEmailInput) {
        console.log('Email input found, setting up validation');
        
        // Clear validation styling on input
        repEmailInput.addEventListener('input', function() {
            repEmailInput.classList.remove('is-invalid');
            if (repEmailFeedback) {
                repEmailFeedback.textContent = '';
            }
        });
        
        // Validate on blur (when user leaves the field)
        repEmailInput.addEventListener('blur', function() {
            const email = repEmailInput.value.trim();
            console.log('Validating email on blur:', email);
            
            if (!email) {
                repEmailInput.classList.add('is-invalid');
                if (repEmailFeedback) {
                    repEmailFeedback.textContent = 'Email is required';
                }
            } else if (!validateEmail(email)) {
                repEmailInput.classList.add('is-invalid');
                if (repEmailFeedback) {
                    repEmailFeedback.textContent = 'Please enter a valid email address';
                }
            } else {
                repEmailInput.classList.add('is-valid');
            }
        });
    } else {
        console.warn('Email input not found in the form');
    }
    
    // Set up password confirmation validation
    if (repPasswordInput && repConfirmPasswordInput) {
        repConfirmPasswordInput.addEventListener('input', function() {
            if (repPasswordInput.value !== repConfirmPasswordInput.value) {
                repConfirmPasswordInput.classList.add('is-invalid');
                repConfirmPasswordInput.classList.remove('is-valid');
            } else {
                repConfirmPasswordInput.classList.remove('is-invalid');
                repConfirmPasswordInput.classList.add('is-valid');
            }
        });
    }
    
    // Add submit event listeners to signup forms
    if (repSignupForm) {
        repSignupForm.addEventListener('submit', handleRepSignupSubmit);
    }
    
    if (companySignupForm) {
        companySignupForm.addEventListener('submit', handleCompanySignupSubmit);
    }
    
    console.log('Signup form initialization complete');
});

/**
 * Simple email validation function
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
function validateEmail(email) {
    console.log('Validating email:', email);
    if (!email || email.trim() === '') {
        console.error('Email validation failed: empty email address');
        return false;
    }
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const result = re.test(email);
    console.log(`Email validation result for "${email}": ${result}`);
    return result;
}

/**
 * Handle rep signup form submission
 * @param {Event} event - Form submit event
 */
async function handleRepSignupSubmit(event) {
    event.preventDefault();
    console.log('Rep signup form submitted');
    
    // IMPORTANT: Get and store the email value immediately
    const emailInput = document.getElementById('rep-email');
    const emailValue = emailInput ? emailInput.value.trim() : '';
    console.log(`[DEBUG] Email value at start: ${emailValue}`);
    
    if (!emailValue) {
        console.error('Email is empty at form submission start');
        displayErrorMessage('rep-email', 'Email is required');
        return; // Stop submission if email is empty
    }
    
    // Clear validation states but DO NOT clear the values
    const form = event.target;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
    });
    
    console.log('Form values preserved, proceeding with validation');
    console.log(`[DEBUG] Email value before getting userData: ${emailValue}`);
    
    // Get all form values - use the stored email value to ensure it's not lost
    const userData = {
        firstName: document.getElementById('first-name')?.value.trim() || '',
        lastName: document.getElementById('last-name')?.value.trim() || '',
        email: emailValue, // Use the already captured email value
        phone: document.getElementById('phone')?.value.trim() || '',
        password: document.getElementById('rep-password')?.value || '',
        confirmPassword: document.getElementById('rep-confirm-password')?.value || '',
        location: document.getElementById('location')?.value.trim() || '',
        experience: document.getElementById('experience')?.value || '',
        specialty: document.getElementById('specialty')?.value || '',
        termsAccepted: document.getElementById('rep-terms')?.checked || false
    };
    
    console.log(`[DEBUG] Email value in userData object: ${userData.email}`);

    // Double-check email validity before validation
    if (!userData.email) {
        console.error('Email is empty in userData object');
        displayErrorMessage('rep-email', 'Email is required');
        return; // Stop submission if email is empty
    }

    // Validate ALL form inputs
    if (!validateRepSignupForm(userData)) {
        console.log('Form validation failed');
        return; // Stop submission if validation fails
    }
    
    // If validation passes, proceed with signup
    console.log('Form validation passed, attempting signup');
    console.log(`[DEBUG] Email value before showing loading state: ${userData.email}`);
    
    // Show loading state
    toggleLoadingState(true, 'rep');
    console.log(`[DEBUG] Email value before calling authModule.signUp: ${userData.email}`);
    
    try {
        // Final validation check before API call
        if (!userData.email) {
            throw new Error('Email validation failed: empty email address');
        }
        
        // Attempt to sign up user
        await signUp(userData, USER_TYPES.REP);
        
        // Handle successful signup
        handleSuccessfulSignup();
    } catch (error) {
        // Handle signup error
        console.error('Signup error:', error);
        handleSignupError(error);
    } finally {
        // Hide loading state
        toggleLoadingState(false, 'rep');
    }
}

/**
 * Handle company signup form submission
 * @param {Event} event - Form submit event
 */
async function handleCompanySignupSubmit(event) {
    event.preventDefault();
    console.log('Company signup form submitted');
    
    // IMPORTANT: Get and store the email value immediately
    const emailInput = document.getElementById('company-email');
    const emailValue = emailInput ? emailInput.value.trim() : '';
    console.log(`[DEBUG] Company email value at start: ${emailValue}`);
    
    if (!emailValue) {
        console.error('Company email is empty at form submission start');
        displayErrorMessage('company-email', 'Email is required');
        return; // Stop submission if email is empty
    }
    
    // Get form values - use the stored email value to ensure it's not lost
    const userData = {
        companyName: document.getElementById('company-name')?.value.trim() || '',
        companyType: document.getElementById('company-type')?.value || '',
        contactName: document.getElementById('contact-name')?.value.trim() || '',
        contactTitle: document.getElementById('contact-title')?.value.trim() || '',
        email: emailValue, // Use the already captured email value
        phone: document.getElementById('company-phone')?.value.trim() || '',
        password: document.getElementById('company-password')?.value || '',
        confirmPassword: document.getElementById('company-confirm-password')?.value || '',
        location: document.getElementById('company-location')?.value.trim() || '',
        website: document.getElementById('company-website')?.value.trim() || '',
        termsAccepted: document.getElementById('company-terms')?.checked || false
    };
    
    console.log(`[DEBUG] Company email value in userData object: ${userData.email}`);

    // Double-check email validity before validation
    if (!userData.email) {
        console.error('Company email is empty in userData object');
        displayErrorMessage('company-email', 'Email is required');
        return; // Stop submission if email is empty
    }
    
    // Validate form inputs
    if (!validateCompanySignupForm(userData)) {
        // Ensure email field still has its value after validation
        if (emailInput) {
            emailInput.value = userData.email;
        }
        return;
    }
    
    // Show loading state
    toggleLoadingState(true, 'company');
    
    try {
        // Final validation check before API call
        if (!userData.email) {
            throw new Error('Email validation failed: empty email address');
        }
        
        // Attempt to sign up company
        await signUp(userData, USER_TYPES.COMPANY);
        
        // Handle successful signup
        handleSuccessfulSignup();
    } catch (error) {
        // Handle signup error
        console.error('Company signup error:', error);
        handleSignupError(error);
        
        // Restore email value after error
        if (emailInput) {
            emailInput.value = userData.email;
        }
    } finally {
        // Hide loading state
        toggleLoadingState(false, 'company');
    }
}

/**
 * Validate rep signup form inputs
 * @param {Object} userData - User data from form
 * @returns {boolean} - True if form is valid
 */
function validateRepSignupForm(userData) {
    // Reset previous error messages ONCE at the beginning
    resetErrorMessages();
    
    let isValid = true;
    
    // Validate first name
    if (!userData.firstName) {
        displayErrorMessage('first-name', 'First name is required');
        isValid = false;
    }
    
    // Validate last name
    if (!userData.lastName) {
        displayErrorMessage('last-name', 'Last name is required');
        isValid = false;
    }
    
    // Validate email (moved from handleRepSignupSubmit)
    const emailInput = document.getElementById('rep-email'); // Get the input element
    const emailFeedback = document.getElementById('rep-email-feedback'); // Get feedback element
    if (!userData.email) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (emailFeedback) emailFeedback.textContent = 'Email is required';
        isValid = false;
        console.log('Email validation failed: empty');
    } else if (!validateEmail(userData.email)) { // Use the existing validateEmail function
        if (emailInput) emailInput.classList.add('is-invalid');
        if (emailFeedback) emailFeedback.textContent = 'Please enter a valid email address';
        isValid = false;
        console.log('Email validation failed: invalid format');
    }
    
    // Validate phone
    if (!userData.phone) {
        displayErrorMessage('phone', 'Phone number is required');
        isValid = false;
    }
    
    // Validate password
    if (!userData.password) {
        displayErrorMessage('rep-password', 'Password is required');
        isValid = false;
    } else if (!isValidPassword(userData.password)) {
        displayErrorMessage('rep-password', 'Password must be at least 8 characters with a number and special character');
        isValid = false;
    }
    
    // Validate confirm password
    if (!userData.confirmPassword) {
        displayErrorMessage('rep-confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (userData.password !== userData.confirmPassword) {
        displayErrorMessage('rep-confirm-password', 'Passwords do not match');
        isValid = false;
    }
    
    // Validate location
    if (!userData.location) {
        displayErrorMessage('location', 'Location is required');
        isValid = false;
    }
    
    // Validate experience
    if (!userData.experience) {
        displayErrorMessage('experience', 'Please select your experience level');
        isValid = false;
    }
    
    // Validate specialty
    if (!userData.specialty) {
        displayErrorMessage('specialty', 'Please select your primary specialty');
        isValid = false;
    }
    
    // Validate terms acceptance
    if (!userData.termsAccepted) {
        displayErrorMessage('rep-terms', 'You must agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate company signup form inputs
 * @param {Object} userData - User data from form
 * @returns {boolean} - True if form is valid
 */
function validateCompanySignupForm(userData) {
    // Reset previous error messages
    resetErrorMessages();
    
    let isValid = true;
    
    // Validate company name
    if (!userData.companyName) {
        displayErrorMessage('company-name', 'Company name is required');
        isValid = false;
    }
    
    // Validate company type
    if (!userData.companyType) {
        displayErrorMessage('company-type', 'Please select your company type');
        isValid = false;
    }
    
    // Validate contact name
    if (!userData.contactName) {
        displayErrorMessage('contact-name', 'Contact name is required');
        isValid = false;
    }
    
    // Validate contact title
    if (!userData.contactTitle) {
        displayErrorMessage('contact-title', 'Job title is required');
        isValid = false;
    }
    
    // Validate email
    if (!userData.email) {
        displayErrorMessage('company-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(userData.email)) {
        displayErrorMessage('company-email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    if (!userData.phone) {
        displayErrorMessage('company-phone', 'Phone number is required');
        isValid = false;
    }
    
    // Validate password
    if (!userData.password) {
        displayErrorMessage('company-password', 'Password is required');
        isValid = false;
    } else if (!isValidPassword(userData.password)) {
        displayErrorMessage('company-password', 'Password must be at least 8 characters with a number and special character');
        isValid = false;
    }
    
    // Validate confirm password
    if (!userData.confirmPassword) {
        displayErrorMessage('company-confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (userData.password !== userData.confirmPassword) {
        displayErrorMessage('company-confirm-password', 'Passwords do not match');
        isValid = false;
    }
    
    // Validate location
    if (!userData.location) {
        displayErrorMessage('company-location', 'Company location is required');
        isValid = false;
    }
    
    // Validate website (optional)
    if (userData.website && !isValidUrl(userData.website)) {
        displayErrorMessage('company-website', 'Please enter a valid URL');
        isValid = false;
    }
    
    // Validate terms acceptance
    if (!userData.termsAccepted) {
        displayErrorMessage('company-terms', 'You must agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
    // Log the email being validated for debugging
    console.log('Validating email:', email);
    
    if (!email || email.trim() === '') {
        console.log('Email is empty');
        return false;
    }
    
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    
    console.log('Email validation result:', isValid);
    return isValid;
}

/**
 * Check if password is valid
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password is valid
 */
function isValidPassword(password) {
    // Password must be at least 8 characters with a number and special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
    return passwordRegex.test(password);
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
            // Find the closest input-group to append the error message
            const inputGroup = field.closest('.input-group');
            if (inputGroup) {
                // If field is in an input-group, append after the input-group
                inputGroup.parentNode.appendChild(errorElement);
            } else {
                // Otherwise append directly after the field
                field.parentNode.appendChild(errorElement);
            }
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
 * Clear error message for a specific field
 * @param {string} fieldId - ID of field to clear error for
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        // Remove is-invalid class from the field
        field.classList.remove('is-invalid');
        
        // Find and remove any associated error messages
        const parent = field.closest('.input-group') || field.parentNode;
        const errorMessage = parent.querySelector('.invalid-feedback');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

/**
 * Toggle loading state of form
 * @param {boolean} isLoading - Whether form is in loading state
 * @param {string} formType - Type of form ('rep' or 'company')
 */
function toggleLoadingState(isLoading, formType) {
    const formId = formType === 'rep' ? 'rep-signup-form' : 'company-signup-form';
    const submitButton = document.querySelector(`#${formId} button[type="submit"]`);
    
    if (submitButton) {
        if (isLoading) {
            // Disable submit button and show loading indicator
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating Account...';
        } else {
            // Enable submit button and restore original text
            submitButton.disabled = false;
            submitButton.textContent = formType === 'rep' ? 'Create Account' : 'Create Company Account';
        }
    }
}

/**
 * Handle successful signup
 */
function handleSuccessfulSignup() {
    // Redirect to onboarding page
    window.location.href = 'onboarding/index.html';
}

/**
 * Handle signup error
 * @param {Error} error - Signup error
 */
function handleSignupError(error) {
    console.error('Signup error:', error);
    
    // Display appropriate error message based on error code
    let errorMessage = 'An error occurred during signup. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email or try logging in.';
    } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
    } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
    }
    
    // Show error alert
    showErrorAlert(errorMessage);
}

/**
 * Show error alert
 * @param {string} message - Error message to display
 */
function showErrorAlert(message) {
    // Get active tab content
    const activeTabContent = document.querySelector('.tab-pane.active');
    
    if (activeTabContent) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertElement.role = 'alert';
        
        // Add alert content
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert alert at the top of the active tab content
        activeTabContent.insertBefore(alertElement, activeTabContent.firstChild);
        
        // Auto-dismiss alert after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }, 5000);
    }
}
