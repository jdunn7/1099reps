/**
 * 1099REPS Profile Handler
 * Handles user profile management and updates
 */

// Import auth module functions
import * as authModule from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Listen for auth state changes (in case the user isn't loaded yet)
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in, initialize profile
                initializeProfile();
            } else {
                // No user is signed in, redirect to login
                window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }
        });
    } else {
        // User is already signed in, initialize profile
        initializeProfile();
    }
    
    // Set up logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }
    
    // Set up form submission handlers
    setupFormHandlers();
});

/**
 * Initialize profile with user data
 */
async function initializeProfile() {
    try {
        // Get current user
        const user = firebase.auth().currentUser;
        
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
        updateProfileUI(userData);
    } catch (error) {
        console.error('Error initializing profile:', error);
        showErrorAlert('Error loading profile data. Please refresh the page.');
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
 * Update profile UI with user data
 * @param {Object} userData - User data
 */
function updateProfileUI(userData) {
    // Update user info in navigation
    updateNavUserInfo(userData);
    
    // Update profile header
    updateProfileHeader(userData);
    
    // Update form fields based on user type
    if (userData.userType === 'rep') {
        updateRepProfileForm(userData);
    } else if (userData.userType === 'company') {
        updateCompanyProfileForm(userData);
    }
}

/**
 * Update user info in navigation
 * @param {Object} userData - User data
 */
function updateNavUserInfo(userData) {
    const navUserName = document.getElementById('navUserName');
    const navUserAvatar = document.getElementById('navUserAvatar');
    
    if (navUserName) {
        if (userData.userType === 'rep') {
            navUserName.textContent = `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim() || 'My Account';
        } else if (userData.userType === 'company') {
            navUserName.textContent = userData.profile.companyName || 'My Account';
        }
    }
    
    if (navUserAvatar && userData.profile.avatarUrl) {
        navUserAvatar.src = userData.profile.avatarUrl;
    }
}

/**
 * Update profile header with user data
 * @param {Object} userData - User data
 */
function updateProfileHeader(userData) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName) {
        if (userData.userType === 'rep') {
            profileName.textContent = `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim() || 'My Account';
        } else if (userData.userType === 'company') {
            profileName.textContent = userData.profile.companyName || 'My Account';
        }
    }
    
    if (profileEmail) {
        profileEmail.textContent = userData.email || '';
    }
    
    if (profileAvatar && userData.profile.avatarUrl) {
        profileAvatar.src = userData.profile.avatarUrl;
    }
}

/**
 * Update rep profile form with user data
 * @param {Object} userData - User data
 */
function updateRepProfileForm(userData) {
    // Personal information form
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const location = document.getElementById('location');
    const bio = document.getElementById('bio');
    
    if (firstName) firstName.value = userData.profile.firstName || '';
    if (lastName) lastName.value = userData.profile.lastName || '';
    if (email) email.value = userData.email || '';
    if (phone) phone.value = userData.profile.phone || '';
    if (location) location.value = userData.profile.location || '';
    if (bio) bio.value = userData.profile.bio || '';
    
    // Professional information form
    const specialty = document.getElementById('specialty');
    const experience = document.getElementById('experience');
    const skills = document.getElementById('skills');
    const certifications = document.getElementById('certifications');
    
    if (specialty) specialty.value = userData.profile.specialty || '';
    if (experience) experience.value = userData.profile.experience || '';
    if (skills) skills.value = userData.profile.skills || '';
    if (certifications) certifications.value = userData.profile.certifications || '';
}

/**
 * Update company profile form with user data
 * @param {Object} userData - User data
 */
function updateCompanyProfileForm(userData) {
    // TODO: Implement company profile form update
    // This would be similar to updateRepProfileForm but with company-specific fields
}

/**
 * Set up form submission handlers
 */
function setupFormHandlers() {
    // Personal information form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    }
    
    // Professional information form
    const professionalInfoForm = document.getElementById('professionalInfoForm');
    if (professionalInfoForm) {
        professionalInfoForm.addEventListener('submit', handleProfessionalInfoSubmit);
    }
    
    // Account settings form
    const accountSettingsForm = document.getElementById('accountSettingsForm');
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', handleAccountSettingsSubmit);
    }
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
    
    // Change avatar button
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', handleChangeAvatar);
    }
}

/**
 * Handle personal information form submission
 * @param {Event} event - Form submit event
 */
async function handlePersonalInfoSubmit(event) {
    event.preventDefault();
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // Get form data
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData.entries());
        
        // Get user type
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userType = userDoc.data().userType;
        
        // Update profile in Firestore
        const collection = userType === 'rep' ? 'reps' : 'companies';
        await firebase.firestore().collection(collection).doc(user.uid).update({
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            location: userData.location,
            bio: userData.bio,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showSuccessAlert('Personal information updated successfully');
    } catch (error) {
        console.error('Error updating personal information:', error);
        showErrorAlert('Error updating personal information. Please try again.');
    }
}

/**
 * Handle professional information form submission
 * @param {Event} event - Form submit event
 */
async function handleProfessionalInfoSubmit(event) {
    event.preventDefault();
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // Get form data
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData.entries());
        
        // Get user type
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userType = userDoc.data().userType;
        
        if (userType !== 'rep') {
            throw new Error('Only representatives can update professional information');
        }
        
        // Update profile in Firestore
        await firebase.firestore().collection('reps').doc(user.uid).update({
            specialty: userData.specialty,
            experience: userData.experience,
            skills: userData.skills,
            certifications: userData.certifications,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showSuccessAlert('Professional information updated successfully');
    } catch (error) {
        console.error('Error updating professional information:', error);
        showErrorAlert('Error updating professional information. Please try again.');
    }
}

/**
 * Handle account settings form submission
 * @param {Event} event - Form submit event
 */
async function handleAccountSettingsSubmit(event) {
    event.preventDefault();
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // Get form data
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData.entries());
        
        // Validate passwords
        if (userData.newPassword !== userData.confirmPassword) {
            throw new Error('New passwords do not match');
        }
        
        // Update password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            userData.currentPassword
        );
        
        // Reauthenticate user
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(userData.newPassword);
        
        // Clear form
        event.target.reset();
        
        showSuccessAlert('Password updated successfully');
    } catch (error) {
        console.error('Error updating password:', error);
        
        if (error.code === 'auth/wrong-password') {
            showErrorAlert('Current password is incorrect. Please try again.');
        } else if (error.code === 'auth/weak-password') {
            showErrorAlert('New password is too weak. Please choose a stronger password.');
        } else {
            showErrorAlert('Error updating password. Please try again.');
        }
    }
}

/**
 * Handle delete account button click
 */
async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        // Get user type
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userType = userDoc.data().userType;
        
        // Delete profile document
        const collection = userType === 'rep' ? 'reps' : 'companies';
        await firebase.firestore().collection(collection).doc(user.uid).delete();
        
        // Delete user document
        await firebase.firestore().collection('users').doc(user.uid).delete();
        
        // Delete user account
        await user.delete();
        
        // Redirect to home page
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error deleting account:', error);
        showErrorAlert('Error deleting account. Please try again.');
    }
}

/**
 * Handle change avatar button click
 */
function handleChangeAvatar() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Handle file selection
    fileInput.addEventListener('change', async (event) => {
        if (event.target.files.length === 0) {
            return;
        }
        
        const file = event.target.files[0];
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            // Upload file to Firebase Storage
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`avatars/${user.uid}/${file.name}`);
            
            // Show loading state
            const profileAvatar = document.getElementById('profileAvatar');
            const navUserAvatar = document.getElementById('navUserAvatar');
            
            if (profileAvatar) {
                profileAvatar.classList.add('opacity-50');
            }
            
            // Upload file
            const snapshot = await fileRef.put(file);
            
            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Get user type
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const userType = userDoc.data().userType;
            
            // Update profile in Firestore
            const collection = userType === 'rep' ? 'reps' : 'companies';
            await firebase.firestore().collection(collection).doc(user.uid).update({
                avatarUrl: downloadURL,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update UI
            if (profileAvatar) {
                profileAvatar.src = downloadURL;
                profileAvatar.classList.remove('opacity-50');
            }
            
            if (navUserAvatar) {
                navUserAvatar.src = downloadURL;
            }
            
            showSuccessAlert('Profile picture updated successfully');
        } catch (error) {
            console.error('Error updating profile picture:', error);
            showErrorAlert('Error updating profile picture. Please try again.');
        }
    });
    
    // Trigger file selection
    fileInput.click();
}

/**
 * Handle logout button click
 * @param {Event} event - Click event
 */
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        // Sign out user
        await firebase.auth().signOut();
        
        // Redirect to home page
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showErrorAlert('Error signing out. Please try again.');
    }
}

/**
 * Show success alert
 * @param {string} message - Success message to display
 */
function showSuccessAlert(message) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4 shadow-sm';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add alert to document
    document.body.appendChild(alertElement);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
        }, 150);
    }, 5000);
}

/**
 * Show error alert
 * @param {string} message - Error message to display
 */
function showErrorAlert(message) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4 shadow-sm';
    alertElement.style.zIndex = '9999';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add alert to document
    document.body.appendChild(alertElement);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
        }, 150);
    }, 5000);
}
