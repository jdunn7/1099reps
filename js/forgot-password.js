/**
 * 1099REPS Forgot Password Handler
 * Handles password reset request form submission and validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get forgot password form element
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    // Add submit event listener to forgot password form
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    }
});

/**
 * Handle forgot password form submission
 * @param {Event} event - Form submit event
 */
async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    
    // Get form input
    const emailInput = document.getElementById('email');
    
    // Get form value
    const email = emailInput.value.trim();
    
    // Validate form input
    if (!validateForgotPasswordForm(email)) {
        return;
    }
    
    // Show loading state
    toggleLoadingState(true);
    
    try {
        // Attempt to send password reset email
        await window.authModule.resetPassword(email);
        
        // Handle successful password reset request
        handleSuccessfulPasswordResetRequest(email);
    } catch (error) {
        // Handle password reset error
        handlePasswordResetError(error);
    } finally {
        // Hide loading state
        toggleLoadingState(false);
    }
}

/**
 * Validate forgot password form input
 * @param {string} email - User email
 * @returns {boolean} - True if form is valid
 */
function validateForgotPasswordForm(email) {
    // Reset previous error messages
    resetErrorMessages();
    
    let isValid = true;
    
    // Validate email
    if (!email) {
        displayErrorMessage('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Please enter a valid email address');
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    field.parentNode.appendChild(errorElement);
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
    const submitButton = document.querySelector('#forgot-password-form button[type="submit"]');
    
    if (isLoading) {
        // Disable submit button and show loading indicator
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    } else {
        // Enable submit button and restore original text
        submitButton.disabled = false;
        submitButton.textContent = 'Reset Password';
    }
}

/**
 * Handle successful password reset request
 * @param {string} email - User email
 */
function handleSuccessfulPasswordResetRequest(email) {
    // Hide the form
    const form = document.getElementById('forgot-password-form');
    form.style.display = 'none';
    
    // Show success message
    const cardBody = form.parentNode;
    const successMessage = document.createElement('div');
    
    successMessage.className = 'text-center';
    successMessage.innerHTML = `
        <div class="mb-4">
            <div class="rounded-circle bg-success bg-opacity-10 mx-auto p-4 mb-3" style="width: fit-content;">
                <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
            </div>
            <h2 class="h4 fw-bold">Check Your Email</h2>
            <p class="text-muted">We've sent a password reset link to <strong>${email}</strong>. Please check your inbox and follow the instructions to reset your password.</p>
            <p class="text-muted small">If you don't see the email, check your spam folder or <a href="#" id="resend-link" class="text-decoration-none">click here to resend</a>.</p>
        </div>
        <a href="login.html" class="btn btn-primary">Back to Login</a>
    `;
    
    cardBody.appendChild(successMessage);
    
    // Add event listener to resend link
    const resendLink = document.getElementById('resend-link');
    if (resendLink) {
        resendLink.addEventListener('click', async (event) => {
            event.preventDefault();
            
            try {
                // Attempt to resend password reset email
                await window.authModule.resetPassword(email);
                
                // Show success message
                alert('Password reset email resent successfully!');
            } catch (error) {
                console.error('Error resending password reset email:', error);
                alert('Error resending password reset email. Please try again.');
            }
        });
    }
}

/**
 * Handle password reset error
 * @param {Error} error - Password reset error
 */
function handlePasswordResetError(error) {
    console.error('Password reset error:', error);
    
    // Display appropriate error message based on error code
    let errorMessage = 'An error occurred while sending the password reset email. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check and try again.';
    } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
    } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many password reset attempts. Please try again later.';
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
    const form = document.getElementById('forgot-password-form');
    form.parentNode.insertBefore(alertElement, form);
    
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
    }, 5000);
}
