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
  analytics = firebase.analytics();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// User types
const USER_TYPES = {
  REP: 'rep',
  COMPANY: 'company'
};

// Create a compatibility layer for the window.authModule object
// This ensures the modernized Firebase code still works with the existing JS files
export const authModule = {
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

// Export the auth module and individual functions for direct use
export { authModule };
export const signUp = authModule.signUp;
export const signIn = authModule.signIn;
export const signOut = authModule.signOut;
export const sendPasswordResetEmail = authModule.sendPasswordResetEmail;
export const getCurrentUser = authModule.getCurrentUser;
export const isLoggedIn = authModule.isLoggedIn;
export const getUserProfile = authModule.getUserProfile;
export const updateUserProfile = authModule.updateUserProfile;
export const signInWithGoogle = authModule.signInWithGoogle;
export const signInWithLinkedIn = authModule.signInWithLinkedIn;
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
