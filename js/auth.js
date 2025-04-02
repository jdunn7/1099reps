/**
 * 1099REPS Authentication Module
 * Handles user authentication, registration, and session management
 */

// Firebase is loaded via script tags in the HTML files
// This file uses the compatibility version of Firebase

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqcHB8RcERGTEx_Owj9r1tgLOmEpwuSpo",
  authDomain: "reps-9a143.firebaseapp.com",
  projectId: "reps-9a143",
  storageBucket: "reps-9a143.appspot.com",
  messagingSenderId: "284932017183",
  appId: "1:284932017183:web:fc6923756efd46f785592a",
  measurementId: "G-GMT65DEEND"
};

// Initialize Firebase with error handling
let auth;
let db;
let analytics;

try {
  // Initialize Firebase with the compatibility version
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  
  // Only initialize analytics if the SDK is available
  if (typeof firebase.analytics === 'function') {
    analytics = firebase.analytics();
  } else {
    console.log("Firebase Analytics SDK not loaded, skipping initialization");
  }
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// User types
const USER_TYPES = {
  REP: 'rep',
  COMPANY: 'company'
};

// Previously had an authModule export here, but we've replaced it with standalone functions
// Define the authModule object for internal use only
const authModule = {
  // User types
  USER_TYPES: USER_TYPES,
  
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
      console.log('Starting signup with email:', userData.email);
      
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

// Define standalone functions for export

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember the user
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export async function signIn(email, password, rememberMe = false) {
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
}

/**
 * Sign up a new user
 * @param {Object} userData - User data
 * @param {string} userType - User type (rep or company)
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export async function signUp(userData, userType) {
  try {
    console.log('Starting signup with email:', userData.email);
    
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

/**
 * Sign out current user
 * @returns {Promise<boolean>} - True if sign out successful
 */
export async function signOut() {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if email sent successfully
 */
export async function sendPasswordResetEmail(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Get current user
 * @returns {Object|null} - Firebase user object or null if not signed in
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Check if user is logged in
 * @returns {boolean} - True if user is logged in
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User profile data
 */
export async function getUserProfile(userId) {
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
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<boolean>} - True if update successful
 */
export async function updateUserProfile(userId, profileData) {
  try {
    await db.collection('users').doc(userId).update(profileData);
    return true;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
}

/**
 * Sign in with Google
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await auth.signInWithPopup(provider);
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

/**
 * Sign in with LinkedIn
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export async function signInWithLinkedIn() {
  try {
    // LinkedIn sign in is not implemented yet
    throw new Error('LinkedIn sign in is not implemented yet');
  } catch (error) {
    console.error('LinkedIn sign in error:', error);
    throw error;
  }
}
export { USER_TYPES };

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

// Auth module is already exported above
