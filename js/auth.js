/**
 * 1099REPS Authentication Module
 * Handles user authentication, registration, and session management
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqcHB8RcERGTEx_Owj9r1tgLOmEpwuSpo",
  authDomain: "reps-9a143.firebaseapp.com",
  projectId: "reps-9a143",
  storageBucket: "reps-9a143.firebasestorage.app",
  messagingSenderId: "284932017183",
  appId: "1:284932017183:web:fc6923756efd46f785592a",
  measurementId: "G-GMT65DEEND"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// User types
const USER_TYPES = {
  REP: 'rep',
  COMPANY: 'company'
};

// Create a global authModule object for use in other scripts
window.authModule = {
  // Sign in with email and password
  signIn: async function(email, password, rememberMe = false) {
    try {
      // Set persistence based on remember me option
      const persistence = rememberMe 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;
      
      await auth.setPersistence(persistence);
      
      // Attempt to sign in user
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  
  // Sign out current user
  signOut: async function() {
    try {
      await auth.signOut();
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  
  // Send password reset email
  sendPasswordResetEmail: async function(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: function() {
    return auth.currentUser;
  },
  
  // Check if user is logged in
  isLoggedIn: function() {
    return auth.currentUser !== null;
  },
  
  // Sign in with Google
  signInWithGoogle: async function() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      return await auth.signInWithPopup(provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },
  
  // Sign in with LinkedIn
  signInWithLinkedIn: async function() {
    try {
      // Note: LinkedIn requires additional setup with Firebase Auth
      // This is a placeholder - you'll need to implement OAuth for LinkedIn
      throw new Error('LinkedIn authentication requires additional setup');
    } catch (error) {
      console.error('LinkedIn sign in error:', error);
      throw error;
    }
  },
  
  // Get user profile
  getUserProfile: async function(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        return userDoc.data();
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateUserProfile: async function(userId, profileData) {
    try {
      await db.collection('users').doc(userId).update(profileData);
      return true;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  },
  
  // Sign up a new user
  signUp: async function(userData, userType) {
    try {
      // Create user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );
      
      // Add user data to Firestore
      const userId = userCredential.user.uid;
      await db.collection('users').doc(userId).set({
        userId: userId,
        userType: userType,
        email: userData.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...userData,
        // Remove password from data stored in Firestore
        password: undefined,
        confirmPassword: undefined
      });
      
      // Create specific profile based on user type
      if (userType === USER_TYPES.REP) {
        await db.collection('reps').doc(userId).set({
          userId: userId,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          location: userData.location || '',
          experience: userData.experience || '',
          specialty: userData.specialty || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else if (userType === USER_TYPES.COMPANY) {
        await db.collection('companies').doc(userId).set({
          userId: userId,
          companyName: userData.companyName || '',
          companyType: userData.companyType || '',
          contactName: userData.contactName || '',
          contactTitle: userData.contactTitle || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
};

// Export the auth module for use in other scripts
window.signUp = window.authModule.signUp;

// Export the signIn function for use in other scripts
window.signIn = window.authModule.signIn;

/**
 * Sign out the current user
 * @returns {Promise} - Promise resolving when sign out is complete
 */
async function signOut() {
  try {
    return await auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise} - Promise resolving when email is sent
 */
async function resetPassword(email) {
  try {
    return await auth.sendPasswordResetEmail(email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

/**
 * Get current authenticated user
 * @returns {Object|null} - Current user or null if not authenticated
 */
function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Get user profile data
 * @param {string} userId - User ID
 * @param {string} userType - Type of user (rep or company)
 * @returns {Promise} - Promise resolving to user profile data
 */
async function getUserProfile(userId, userType) {
  try {
    const collection = userType === USER_TYPES.REP ? 'reps' : 'companies';
    const doc = await db.collection(collection).doc(userId).get();
    
    if (doc.exists) {
      return doc.data();
    } else {
      throw new Error('Profile not found');
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {string} userType - Type of user (rep or company)
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - Promise resolving when update is complete
 */
async function updateUserProfile(userId, userType, profileData) {
  try {
    const collection = userType === USER_TYPES.REP ? 'reps' : 'companies';
    return await db.collection(collection).doc(userId).update({
      ...profileData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Sign in with Google
 * @returns {Promise} - Promise resolving to user credentials
 */
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await auth.signInWithPopup(provider);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

/**
 * Sign in with LinkedIn
 * @returns {Promise} - Promise resolving to user credentials
 */
async function signInWithLinkedIn() {
  // Note: LinkedIn authentication requires additional setup with Firebase
  // This is a placeholder for the actual implementation
  console.warn("LinkedIn authentication not fully implemented");
  alert("LinkedIn authentication is not available at this time");
}

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.uid);
    // Update UI for authenticated user
    updateUIForAuthenticatedUser(user);
  } else {
    // User is signed out
    console.log("User is signed out");
    // Update UI for unauthenticated user
    updateUIForUnauthenticatedUser();
  }
});

/**
 * Update UI for authenticated user
 * @param {Object} user - Firebase user object
 */
function updateUIForAuthenticatedUser(user) {
  // Get all nav elements that should be shown/hidden based on auth state
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  
  // Show auth nav items, hide unauth nav items
  authNavItems.forEach(item => item.style.display = 'block');
  unauthNavItems.forEach(item => item.style.display = 'none');
  
  // If on a protected page, load user data
  if (document.querySelector('.dashboard-page')) {
    loadUserDashboard(user);
  }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
  // Get all nav elements that should be shown/hidden based on auth state
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  
  // Hide auth nav items, show unauth nav items
  authNavItems.forEach(item => item.style.display = 'none');
  unauthNavItems.forEach(item => item.style.display = 'block');
  
  // If on a protected page, redirect to login
  if (document.querySelector('.protected-page')) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

// Export functions for use in other modules
window.authModule = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
  isAuthenticated,
  getUserProfile,
  updateUserProfile,
  signInWithGoogle,
  signInWithLinkedIn,
  USER_TYPES
};
