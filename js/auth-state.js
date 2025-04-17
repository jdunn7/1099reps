/**
 * 1099REPS Authentication State Management
 * Handles user authentication state across the site
 */

// Import Firebase configuration
import { USER_TYPES } from './auth.js';

// Initialize variables
let auth;
let db;
let currentUser = null;
let userType = null;

// Initialize Firebase references from the global scope
document.addEventListener('DOMContentLoaded', function() {
  if (typeof firebase !== 'undefined') {
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Set up auth state listener
    initAuthStateListener();
    
    // Initialize UI based on stored auth state (for immediate response before Firebase initializes)
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        updateUIForAuthenticatedUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  } else {
    console.error('Firebase is not loaded');
  }
});

/**
 * Initialize the authentication state listener
 */
function initAuthStateListener() {
  auth.onAuthStateChanged(async (user) => {
    try {
      if (user) {
        // User is signed in
        console.log("User is signed in:", user.uid);
        currentUser = user;
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          userType = userData.userType || USER_TYPES.REP;
          
          // Store user data in localStorage for persistence across pages
          const userDataToStore = {
            uid: user.uid,
            email: user.email,
            userType: userType,
            displayName: userData.displayName || user.displayName || '',
            photoURL: userData.photoURL || user.photoURL || '',
            lastLogin: new Date().toISOString()
          };
          
          localStorage.setItem('user_data', JSON.stringify(userDataToStore));
          localStorage.setItem('user_authenticated', 'true');
          
          // Update UI for authenticated user
          updateUIForAuthenticatedUser(userDataToStore);
          
          // Update last login timestamp
          await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // Create user document if it doesn't exist
          userType = USER_TYPES.REP; // Default to rep
          
          await db.collection('users').doc(user.uid).set({
            userId: user.uid,
            email: user.email,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          // Store minimal user data
          const userDataToStore = {
            uid: user.uid,
            email: user.email,
            userType: userType,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            lastLogin: new Date().toISOString()
          };
          
          localStorage.setItem('user_data', JSON.stringify(userDataToStore));
          localStorage.setItem('user_authenticated', 'true');
          
          // Update UI for authenticated user
          updateUIForAuthenticatedUser(userDataToStore);
        }
        
        // Handle dashboard redirects if needed
        handleDashboardRedirects(userType);
      } else {
        // User is signed out
        console.log("User is signed out");
        currentUser = null;
        userType = null;
        
        // Clear user data from localStorage
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_authenticated');
        
        // Update UI for unauthenticated user
        updateUIForUnauthenticatedUser();
        
        // Handle protected page redirects
        handleProtectedPageRedirects();
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error);
    }
  });
}

/**
 * Update UI for authenticated user
 * @param {Object} userData - User data object
 */
function updateUIForAuthenticatedUser(userData) {
  console.log('Updating UI for authenticated user');
  
  // Get all auth-related elements
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  const userMenus = document.querySelectorAll('.user-menu');
  const userDisplayNames = document.querySelectorAll('.user-display-name');
  const userAvatars = document.querySelectorAll('.user-avatar');
  const userTypeIndicators = document.querySelectorAll('.user-type-indicator');
  
  // Show authenticated elements, hide unauthenticated elements
  authNavItems.forEach(item => item.style.display = '');
  unauthNavItems.forEach(item => item.style.display = 'none');
  
  // Update user display name if available
  if (userData.displayName) {
    userDisplayNames.forEach(element => {
      element.textContent = userData.displayName;
    });
  }
  
  // Update user avatar if available
  if (userData.photoURL) {
    userAvatars.forEach(avatar => {
      if (avatar.tagName.toLowerCase() === 'img') {
        avatar.src = userData.photoURL;
        avatar.alt = userData.displayName || 'User avatar';
      }
    });
  }
  
  // Update user type indicators
  userTypeIndicators.forEach(indicator => {
    indicator.textContent = userData.userType === USER_TYPES.COMPANY ? 'Employer' : 'Rep';
  });
  
  // Show appropriate dashboard link based on user type
  const repDashboardLinks = document.querySelectorAll('.rep-dashboard-link');
  const companyDashboardLinks = document.querySelectorAll('.company-dashboard-link');
  
  if (userData.userType === USER_TYPES.COMPANY) {
    repDashboardLinks.forEach(link => link.style.display = 'none');
    companyDashboardLinks.forEach(link => link.style.display = '');
  } else {
    repDashboardLinks.forEach(link => link.style.display = '');
    companyDashboardLinks.forEach(link => link.style.display = 'none');
  }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
  console.log('Updating UI for unauthenticated user');
  
  // Get all auth-related elements
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  
  // Hide authenticated elements, show unauthenticated elements
  authNavItems.forEach(item => item.style.display = 'none');
  unauthNavItems.forEach(item => item.style.display = '');
}

/**
 * Handle redirects for dashboard pages
 * @param {string} userType - User type (rep or company)
 */
function handleDashboardRedirects(userType) {
  // Only redirect if on a dashboard page
  if (window.location.pathname.includes('/dashboard/')) {
    const isOnRepDashboard = window.location.pathname.includes('/dashboard/') && !window.location.pathname.includes('/employer/dashboard/');
    const isOnCompanyDashboard = window.location.pathname.includes('/employer/dashboard/');
    
    // Redirect if user is on the wrong dashboard
    if (userType === USER_TYPES.COMPANY && isOnRepDashboard) {
      window.location.href = '/employer/dashboard/index.html';
    } else if (userType === USER_TYPES.REP && isOnCompanyDashboard) {
      window.location.href = '/dashboard/index.html';
    }
  }
}

/**
 * Handle redirects for protected pages
 */
function handleProtectedPageRedirects() {
  // Check if current page is protected
  const isProtectedPage = document.querySelector('.protected-page') || 
                         window.location.pathname.includes('/dashboard/') || 
                         window.location.pathname.includes('/employer/dashboard/');
  
  if (isProtectedPage) {
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.html?redirect=${returnUrl}`;
  }
}

/**
 * Handle logout functionality
 */
export async function handleLogout() {
  try {
    // Get Firebase auth from global scope
    const auth = firebase.auth();
    
    // Clear localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_authenticated');
    
    // Sign out from Firebase
    await auth.signOut();
    
    // Redirect to home page
    window.location.href = '/index.html';
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

// Export functions for use in other files
export { initAuthStateListener, updateUIForAuthenticatedUser, updateUIForUnauthenticatedUser };
