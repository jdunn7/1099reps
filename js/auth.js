/**
 * 1099REPS Authentication Module
 * Handles user authentication, registration, and session management
 */

// Development mode flag - set to true for mock authentication
const DEV_MODE = true;

// Mock database for development
const mockDB = {
  users: {},
  reps: {},
  companies: {}
};

// Mock authentication for development
const mockAuth = {
  currentUser: null,
  
  // Mock sign in with email and password
  signInWithEmailAndPassword: function(email, password) {
    return new Promise((resolve, reject) => {
      // For development, accept any email/password combination
      if (DEV_MODE) {
        // Create a mock user if it doesn't exist
        if (!mockDB.users[email]) {
          const userId = 'user_' + Date.now();
          mockDB.users[email] = {
            uid: userId,
            email: email,
            userType: 'rep'
          };
          
          // Create a mock rep profile
          mockDB.reps[userId] = {
            userId: userId,
            firstName: 'Test',
            lastName: 'User',
            phone: '555-123-4567',
            location: 'New York, NY',
            experience: '3-5',
            specialty: 'medical-device'
          };
        }
        
        this.currentUser = mockDB.users[email];
        resolve({ user: this.currentUser });
      } else {
        // In production, this would validate credentials
        reject(new Error('Authentication not implemented in development mode'));
      }
    });
  },
  
  // Mock sign out
  signOut: function() {
    return new Promise((resolve) => {
      this.currentUser = null;
      resolve();
    });
  },
  
  // Mock send password reset email
  sendPasswordResetEmail: function(email) {
    return new Promise((resolve) => {
      console.log('Password reset email sent to:', email);
      resolve();
    });
  }
};

// Use Firebase in production, mock in development
let auth, db;
if (!DEV_MODE && typeof firebase !== 'undefined') {
  // Firebase configuration would go here in production
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} else {
  // Use mock authentication and database in development
  auth = mockAuth;
  db = {
    collection: function(collectionName) {
      return {
        doc: function(docId) {
          return {
            get: function() {
              return new Promise((resolve) => {
                let data;
                let exists = false;
                
                if (collectionName === 'users' && mockDB.users[docId]) {
                  data = mockDB.users[docId];
                  exists = true;
                } else if (collectionName === 'reps' && mockDB.reps[docId]) {
                  data = mockDB.reps[docId];
                  exists = true;
                } else if (collectionName === 'companies' && mockDB.companies[docId]) {
                  data = mockDB.companies[docId];
                  exists = true;
                }
                
                resolve({
                  exists: exists,
                  data: function() {
                    return data;
                  }
                });
              });
            },
            set: function(data) {
              return new Promise((resolve) => {
                if (collectionName === 'users') {
                  mockDB.users[docId] = data;
                } else if (collectionName === 'reps') {
                  mockDB.reps[docId] = data;
                } else if (collectionName === 'companies') {
                  mockDB.companies[docId] = data;
                }
                resolve();
              });
            },
            update: function(data) {
              return new Promise((resolve) => {
                if (collectionName === 'users' && mockDB.users[docId]) {
                  mockDB.users[docId] = { ...mockDB.users[docId], ...data };
                } else if (collectionName === 'reps' && mockDB.reps[docId]) {
                  mockDB.reps[docId] = { ...mockDB.reps[docId], ...data };
                } else if (collectionName === 'companies' && mockDB.companies[docId]) {
                  mockDB.companies[docId] = { ...mockDB.companies[docId], ...data };
                }
                resolve();
              });
            }
          };
        }
      };
    }
  };
}

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
      // Attempt to sign in user
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      // Set persistence based on remember me checkbox
      if (rememberMe) {
        // Store user session in local storage (persists across browser sessions)
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Clear any existing remember me setting
        localStorage.removeItem('rememberMe');
      }
      
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
      localStorage.removeItem('rememberMe');
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
      // In development mode, create a mock user
      if (DEV_MODE) {
        const email = 'google-user@example.com';
        const userId = 'google_user_' + Date.now();
        
        mockDB.users[email] = {
          uid: userId,
          email: email,
          userType: 'rep',
          displayName: 'Google User',
          photoURL: 'https://via.placeholder.com/150'
        };
        
        mockAuth.currentUser = mockDB.users[email];
        return { user: mockAuth.currentUser };
      } else {
        // In production, would use Firebase Google provider
        throw new Error('Google authentication not implemented in development mode');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },
  
  // Sign in with LinkedIn
  signInWithLinkedIn: async function() {
    try {
      // In development mode, create a mock user
      if (DEV_MODE) {
        const email = 'linkedin-user@example.com';
        const userId = 'linkedin_user_' + Date.now();
        
        mockDB.users[email] = {
          uid: userId,
          email: email,
          userType: 'rep',
          displayName: 'LinkedIn User',
          photoURL: 'https://via.placeholder.com/150'
        };
        
        mockAuth.currentUser = mockDB.users[email];
        return { user: mockAuth.currentUser };
      } else {
        // In production, would use Firebase custom auth with LinkedIn
        throw new Error('LinkedIn authentication not implemented in development mode');
      }
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
  }
};

/**
 * Sign up a new user
 * @param {Object} userData - User data for registration
 * @param {string} userType - Type of user (rep or company)
 * @returns {Promise} - Promise resolving to user credentials
 */
async function signUp(userData, userType) {
  try {
    // In development mode, create a mock user
    if (DEV_MODE) {
      const email = userData.email;
      const userId = 'user_' + Date.now();
      
      // Create user in mock database
      mockDB.users[email] = {
        uid: userId,
        email: email,
        userType: userType,
        createdAt: new Date().toISOString(),
        ...userData,
        // Remove password from data stored in database
        password: undefined,
        confirmPassword: undefined
      };
      
      // Set as current user
      mockAuth.currentUser = mockDB.users[email];
      
      // Create profile collection based on user type
      if (userType === USER_TYPES.REP) {
        mockDB.reps[userId] = {
          userId: userId,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          location: userData.location || '',
          experience: userData.experience || '',
          specialty: userData.specialty || ''
        };
      } else if (userType === USER_TYPES.COMPANY) {
        mockDB.companies[userId] = {
          userId: userId,
          companyName: userData.companyName || '',
          industry: userData.industry || '',
          size: userData.size || '',
          location: userData.location || ''
        };
      }
      
      return { user: mockAuth.currentUser };
    } else {
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
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        location: userData.location,
        experience: userData.experience,
        specialty: userData.specialty,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else if (userType === USER_TYPES.COMPANY) {
      await db.collection('companies').doc(userId).set({
        userId: userId,
        companyName: userData.companyName,
        companyType: userData.companyType,
        contactName: userData.contactName,
        contactTitle: userData.contactTitle,
        phone: userData.phone,
        location: userData.location,
        website: userData.website,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

/**
 * Sign in existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to persist the session
 * @returns {Promise} - Promise resolving to user credentials
 */
async function signIn(email, password, rememberMe = false) {
  try {
    // Set persistence based on remember me option
    const persistence = rememberMe 
      ? firebase.auth.Auth.Persistence.LOCAL 
      : firebase.auth.Auth.Persistence.SESSION;
    
    await auth.setPersistence(persistence);
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

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
