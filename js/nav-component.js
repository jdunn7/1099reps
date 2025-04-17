/**
 * 1099REPS Navigation Component
 * Handles responsive navigation and authentication state display
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  initializeNavigation();
  
  // Set up logout button event listeners
  setupLogoutButtons();
});

/**
 * Initialize navigation components
 */
function initializeNavigation() {
  // Get navigation container
  const navContainer = document.querySelector('#navbarNav');
  
  // If navigation container exists, set up the navigation
  if (navContainer) {
    // Check if user is authenticated based on localStorage
    const isAuthenticated = localStorage.getItem('user_authenticated') === 'true';
    let userData = null;
    
    if (isAuthenticated) {
      try {
        userData = JSON.parse(localStorage.getItem('user_data'));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Update navigation based on authentication state
    updateNavigation(isAuthenticated, userData);
  }
}

/**
 * Update navigation based on authentication state
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Object} userData - User data object
 */
function updateNavigation(isAuthenticated, userData) {
  // Get navigation elements
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  const userMenus = document.querySelectorAll('.user-menu');
  
  if (isAuthenticated && userData) {
    // User is authenticated
    
    // Show authenticated nav items, hide unauthenticated nav items
    authNavItems.forEach(item => item.style.display = '');
    unauthNavItems.forEach(item => item.style.display = 'none');
    
    // Update user display name
    const userDisplayNames = document.querySelectorAll('.user-display-name');
    userDisplayNames.forEach(element => {
      element.textContent = userData.displayName || userData.email || 'User';
    });
    
    // Update user avatar
    const userAvatars = document.querySelectorAll('.user-avatar img');
    userAvatars.forEach(avatar => {
      if (userData.photoURL) {
        avatar.src = userData.photoURL;
      } else {
        // Set default avatar with user's initials
        const initials = getInitials(userData.displayName || userData.email || 'User');
        avatar.style.display = 'none';
        avatar.parentElement.setAttribute('data-initials', initials);
        avatar.parentElement.classList.add('avatar-initials');
      }
    });
    
    // Show appropriate dashboard link based on user type
    const repDashboardLinks = document.querySelectorAll('.rep-dashboard-link');
    const companyDashboardLinks = document.querySelectorAll('.company-dashboard-link');
    
    if (userData.userType === 'company') {
      repDashboardLinks.forEach(link => link.style.display = 'none');
      companyDashboardLinks.forEach(link => link.style.display = '');
    } else {
      repDashboardLinks.forEach(link => link.style.display = '');
      companyDashboardLinks.forEach(link => link.style.display = 'none');
    }
  } else {
    // User is not authenticated
    
    // Hide authenticated nav items, show unauthenticated nav items
    authNavItems.forEach(item => item.style.display = 'none');
    unauthNavItems.forEach(item => item.style.display = '');
  }
}

/**
 * Set up logout button event listeners
 */
function setupLogoutButtons() {
  // Get all logout buttons
  const logoutButtons = document.querySelectorAll('.logout-button');
  
  // Add click event listener to each logout button
  logoutButtons.forEach(button => {
    button.addEventListener('click', async function(event) {
      event.preventDefault();
      
      try {
        // Import the handleLogout function from auth-state.js
        const { handleLogout } = await import('./auth-state.js');
        
        // Handle logout
        await handleLogout();
      } catch (error) {
        console.error('Error during logout:', error);
        
        // Fallback logout if import fails
        if (typeof firebase !== 'undefined' && firebase.auth) {
          try {
            // Clear localStorage
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_authenticated');
            
            // Sign out from Firebase
            await firebase.auth().signOut();
            
            // Redirect to home page
            window.location.href = '/index.html';
          } catch (fallbackError) {
            console.error('Fallback logout error:', fallbackError);
            alert('Error signing out. Please try again.');
          }
        } else {
          alert('Error signing out. Please try again.');
        }
      }
    });
  });
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (1-2 characters)
 */
function getInitials(name) {
  if (!name) return '?';
  
  const parts = name.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Export functions for use in other files
export { updateNavigation, setupLogoutButtons };
