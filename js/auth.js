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
  
  // Enable offline persistence for Firestore
  db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
      console.log("Firestore offline persistence enabled");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn("Multiple tabs open, persistence only enabled in one tab");
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required for persistence
        console.warn("Current browser doesn't support persistence");
      } else {
        console.error("Error enabling persistence:", err);
      }
    });
  
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

// Export USER_TYPES at the top to avoid circular dependencies
export { USER_TYPES };

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
 * @param {string} userType - Type of user (rep or company)
 * @returns {Promise<UserCredential>} - Firebase user credential
 */
export async function signIn(email, password, rememberMe = false, userType = USER_TYPES.REP) {
  console.log(`Signing in user with email: ${email}, userType: ${userType}`);
  
  try {
    // Set persistence based on remember me option
    const persistence = rememberMe 
      ? firebase.auth.Auth.Persistence.LOCAL 
      : firebase.auth.Auth.Persistence.SESSION;
    
    await auth.setPersistence(persistence);
    
    // Attempt to sign in user
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;
    
    console.log(`User authenticated successfully: ${userId}`);
    
    // Store basic auth data in localStorage immediately
    localStorage.setItem('user_authenticated', 'true');
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_uid', userId);
    
    // Verify that the user is of the correct type
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('User document exists:', userData);
        
        // Check if user type matches
        if (userData.userType && userData.userType !== userType) {
          console.error(`User type mismatch. Expected: ${userType}, Found: ${userData.userType}`);
          // If user type doesn't match, sign out and throw an error
          await auth.signOut();
          
          // Clear localStorage
          localStorage.removeItem('user_authenticated');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_uid');
          localStorage.removeItem('user_type');
          localStorage.removeItem('user_data');
          
          throw new Error(`This account is not registered as a ${userType === USER_TYPES.COMPANY ? 'company' : 'medical rep'}. Please use the correct account type.`);
        }
        
        // Update user data in Firestore and localStorage
        const updatedUserData = {
          ...userData,
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Update Firestore
        await db.collection('users').doc(userId).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Store complete user data in localStorage
        localStorage.setItem('user_type', userData.userType);
        localStorage.setItem('user_data', JSON.stringify({
          uid: userId,
          email: email,
          userType: userData.userType,
          displayName: userData.displayName || '',
          lastLogin: new Date().toISOString()
        }));
        
        console.log(`User data updated and stored in localStorage: ${userData.userType}`);
      } else {
        console.log('User document does not exist, creating new document');
        // If the user document doesn't exist yet, create it with the selected type
        // This handles the case of users who authenticated but don't have a Firestore document
        const newUserData = {
          userId: userId,
          userType: userType,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userId).set(newUserData);
        
        // Store user data in localStorage
        localStorage.setItem('user_type', userType);
        localStorage.setItem('user_data', JSON.stringify({
          uid: userId,
          email: email,
          userType: userType,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }));
        
        // Also create the appropriate type-specific document
        if (userType === USER_TYPES.COMPANY) {
          console.log('Creating company document');
          await db.collection('companies').doc(userId).set({
            userId: userId,
            companyName: '',
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          console.log('Creating rep document');
          await db.collection('reps').doc(userId).set({
            userId: userId,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        console.log(`New user document created with type: ${userType}`);
      }
    } catch (error) {
      console.error('Error verifying user type:', error);
      
      // If there was an error checking the user type but we still have authentication,
      // store the basic user data in localStorage as a fallback
      if (!localStorage.getItem('user_type')) {
        localStorage.setItem('user_type', userType);
      }
      
      // Don't throw here, allow login to proceed even if there was an error checking the type
      // This prevents users from being locked out if Firestore has issues
    }
    
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
 * Load user dashboard data based on user type
 * @param {Object} user - Firebase user object
 * @param {string} userType - Type of user (rep or company)
 */
async function loadUserDashboard(user, userType) {
  console.log(`Loading dashboard data for user: ${user.uid}, type: ${userType}`);
  
  try {
    // Get user-specific data based on user type
    if (userType === USER_TYPES.COMPANY) {
      // Load company-specific dashboard data
      const companyDoc = await db.collection('companies').doc(user.uid).get();
      
      if (companyDoc.exists) {
        const companyData = companyDoc.data();
        console.log('Company data loaded:', companyData);
        
        // Update company name in the dashboard if it exists
        const companyNameElement = document.getElementById('company-name');
        if (companyNameElement && companyData.companyName) {
          companyNameElement.textContent = companyData.companyName;
        }
        
        // Load job postings if on employer dashboard
        if (window.location.pathname.includes('/employer/dashboard/')) {
          // Get job postings for this company
          const jobPostingsSnapshot = await db.collection('job_postings')
            .where('companyId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
          
          // Update job postings in the dashboard
          const jobPostingsContainer = document.getElementById('job-postings-list');
          if (jobPostingsContainer) {
            if (!jobPostingsSnapshot.empty) {
              // Clear existing content
              jobPostingsContainer.innerHTML = '';
              
              // Add job postings to the container
              jobPostingsSnapshot.forEach(doc => {
                const jobData = doc.data();
                const jobElement = document.createElement('div');
                jobElement.className = 'job-posting-item';
                jobElement.innerHTML = `
                  <h4>${jobData.title || 'Untitled Position'}</h4>
                  <div class="job-meta">
                    <span class="location"><i class="bi bi-geo-alt"></i> ${jobData.location || 'Remote'}</span>
                    <span class="salary"><i class="bi bi-cash"></i> ${jobData.salary || 'Competitive'}</span>
                  </div>
                  <div class="job-stats">
                    <span class="applicants"><i class="bi bi-people"></i> ${jobData.applicantCount || 0} Applicants</span>
                    <span class="posted-date"><i class="bi bi-calendar"></i> Posted ${formatDate(jobData.createdAt?.toDate() || new Date())}</span>
                  </div>
                `;
                jobPostingsContainer.appendChild(jobElement);
              });
            } else {
              jobPostingsContainer.innerHTML = '<p class="text-muted">No job postings yet. Create your first job posting to attract candidates.</p>';
            }
          }
          
          // Get recent applications for this company's jobs
          const applicationsSnapshot = await db.collection('applications')
            .where('companyId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
          
          // Update recent applications in the dashboard
          const applicationsContainer = document.getElementById('recent-applications-table');
          if (applicationsContainer) {
            const applicationsTableBody = applicationsContainer.querySelector('tbody');
            if (applicationsTableBody) {
              if (!applicationsSnapshot.empty) {
                // Clear existing content
                applicationsTableBody.innerHTML = '';
                
                // Add applications to the table
                applicationsSnapshot.forEach(doc => {
                  const appData = doc.data();
                  const row = document.createElement('tr');
                  
                  // Create a function to handle image loading errors
                  const getProfileImageHtml = (photoUrl) => {
                    if (!photoUrl) {
                      return `<div class="avatar avatar-sm me-2 bg-light rounded-circle d-flex align-items-center justify-content-center">
                        <i class="bi bi-person text-secondary"></i>
                      </div>`;
                    }
                    
                    return `<div class="avatar avatar-sm me-2">
                      <img src="${photoUrl}" alt="Candidate" class="rounded-circle" 
                        onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\"d-flex align-items-center justify-content-center bg-light rounded-circle\" style=\"width:32px;height:32px;\"><i class=\"bi bi-person text-secondary\"></i></div>';">
                    </div>`;
                  };
                  
                  row.innerHTML = `
                    <td>
                      <div class="d-flex align-items-center">
                        ${getProfileImageHtml(appData.candidatePhoto)}
                        <div>
                          <h6 class="mb-0">${appData.candidateName || 'Anonymous Candidate'}</h6>
                          <small class="text-muted">${appData.candidateEmail || 'No email provided'}</small>
                        </div>
                      </div>
                    </td>
                    <td>${appData.jobTitle || 'Untitled Position'}</td>
                    <td>${formatDate(appData.createdAt?.toDate() || new Date())}</td>
                    <td><span class="badge bg-${getStatusBadgeColor(appData.status)}">${appData.status || 'New'}</span></td>
                    <td>
                      <div class="dropdown">
                        <button class="btn btn-sm btn-icon" data-bs-toggle="dropdown" title="More options">
                          <i class="bi bi-three-dots-vertical"></i>
                          <span class="visually-hidden">More options</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li><a class="dropdown-item" href="#">View Profile</a></li>
                          <li><a class="dropdown-item" href="#">Schedule Interview</a></li>
                          <li><a class="dropdown-item" href="#">Send Message</a></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><a class="dropdown-item text-danger" href="#">Reject</a></li>
                        </ul>
                      </div>
                    </td>
                  `;
                  applicationsTableBody.appendChild(row);
                });
              } else {
                applicationsTableBody.innerHTML = `
                  <tr>
                    <td colspan="5" class="text-center py-4">
                      <p class="text-muted mb-0">No applications received yet.</p>
                    </td>
                  </tr>
                `;
              }
            }
          }
        }
      } else {
        console.warn('Company document not found, creating new document');
        // Create company document if it doesn't exist
        await db.collection('companies').doc(user.uid).set({
          userId: user.uid,
          companyName: '',
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } else {
      // Load rep-specific dashboard data
      const repDoc = await db.collection('reps').doc(user.uid).get();
      
      if (repDoc.exists) {
        const repData = repDoc.data();
        console.log('Rep data loaded:', repData);
        
        // Update user name in the dashboard if it exists
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && repData.fullName) {
          userNameElement.textContent = repData.fullName;
        }
        
        // Additional rep dashboard data loading can be added here
      } else {
        console.warn('Rep document not found, creating new document');
        // Create rep document if it doesn't exist
        await db.collection('reps').doc(user.uid).set({
          userId: user.uid,
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    // Update common dashboard elements
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
      userEmailElement.textContent = user.email;
    }
    
    // Remove loading indicators if present
    const loadingElements = document.querySelectorAll('.dashboard-loading');
    loadingElements.forEach(el => el.classList.add('d-none'));
    
    // Show dashboard content
    const dashboardContent = document.querySelectorAll('.dashboard-content');
    dashboardContent.forEach(el => el.classList.remove('d-none'));
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Show error message in dashboard if needed
    const errorContainer = document.getElementById('dashboard-error');
    if (errorContainer) {
      errorContainer.textContent = 'Error loading dashboard data. Please refresh the page.';
      errorContainer.classList.remove('d-none');
    }
  }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diff = now - date;
  const day = 24 * 60 * 60 * 1000;
  
  if (diff < day) {
    return 'Today';
  } else if (diff < 2 * day) {
    return 'Yesterday';
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get badge color based on application status
 * @param {string} status - Application status
 * @returns {string} - Badge color class
 */
function getStatusBadgeColor(status) {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'success';
    case 'in review':
      return 'warning';
    case 'interview':
      return 'info';
    case 'hired':
      return 'primary';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
}

/**
 * Sign out current user
 * @param {boolean} redirectToLogoutPage - Whether to redirect to the logout page
 * @returns {Promise<boolean>} - True if sign out successful
 */
export async function signOut(redirectToLogoutPage = true) {
  try {
    console.log('Signing out user');
    
    // Clear all user data from localStorage
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_uid');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
    
    // Sign out from Firebase
    await auth.signOut();
    console.log('Firebase signOut completed');
    
    // Check if we're already on the logout page to prevent redirect loops
    const isOnLogoutPage = window.location.pathname.includes('/auth/logout.html');
    
    if (redirectToLogoutPage && !isOnLogoutPage) {
      // Redirect to the logout page with a timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      window.location.href = `/auth/logout.html?t=${timestamp}`;
    } else if (!redirectToLogoutPage && !isOnLogoutPage) {
      // If not redirecting to logout page and not already on it, go to homepage
      window.location.href = '/index.html';
    }
    // If already on logout page, do nothing (the page will handle the redirect)
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    
    // Even if there's an error, try to clear localStorage
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_uid');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
    
    // If there's an error and we're not on the logout page, try to redirect to homepage
    if (!window.location.pathname.includes('/auth/logout.html')) {
      window.location.href = '/index.html';
    }
    
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
// USER_TYPES is already exported at the top of the file

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.uid);
    // Update UI for authenticated user
    updateUIForAuthenticatedUser(user).catch(error => {
      console.error('Error in auth state change handler:', error);
    });
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
async function updateUIForAuthenticatedUser(user) {
  console.log('Updating UI for authenticated user:', user.uid);
  
  // Get all nav elements that should be shown/hidden based on auth state
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  
  // Show auth nav items, hide unauth nav items
  authNavItems.forEach(item => item.style.display = 'block');
  unauthNavItems.forEach(item => item.style.display = 'none');
  
  try {
    // Get user data from Firestore to determine user type
    const userDoc = await db.collection('users').doc(user.uid).get();
    let userType = USER_TYPES.REP; // Default to rep if not specified
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      userType = userData.userType || USER_TYPES.REP;
      
      // Store user type and data in localStorage for quick access
      localStorage.setItem('user_type', userType);
      localStorage.setItem('user_data', JSON.stringify({
        uid: user.uid,
        email: user.email,
        userType: userType,
        displayName: userData.displayName || user.displayName || '',
        lastLogin: new Date().toISOString()
      }));
      
      console.log('User type stored:', userType);
    } else {
      console.warn('User document not found in Firestore');
      // Create user document if it doesn't exist
      await db.collection('users').doc(user.uid).set({
        userId: user.uid,
        email: user.email,
        userType: userType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // If on a dashboard page, redirect to the appropriate dashboard if needed
    if (window.location.pathname.includes('/dashboard/')) {
      const isOnRepDashboard = window.location.pathname.includes('/dashboard/') && !window.location.pathname.includes('/employer/dashboard/');
      const isOnCompanyDashboard = window.location.pathname.includes('/employer/dashboard/');
      
      // Redirect if user is on the wrong dashboard
      if (userType === USER_TYPES.COMPANY && isOnRepDashboard) {
        window.location.href = '/employer/dashboard/index.html';
      } else if (userType === USER_TYPES.REP && isOnCompanyDashboard) {
        window.location.href = '/dashboard/index.html';
      } else {
        // Load the appropriate dashboard data
        loadUserDashboard(user, userType);
      }
    }
  } catch (error) {
    console.error('Error updating UI for authenticated user:', error);
  }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
  console.log('Updating UI for unauthenticated user');
  
  // Clear user data from localStorage
  localStorage.removeItem('user_type');
  localStorage.removeItem('user_data');
  
  // Get all nav elements that should be shown/hidden based on auth state
  const authNavItems = document.querySelectorAll('.auth-nav-item');
  const unauthNavItems = document.querySelectorAll('.unauth-nav-item');
  
  // Hide auth nav items, show unauth nav items
  authNavItems.forEach(item => item.style.display = 'none');
  unauthNavItems.forEach(item => item.style.display = 'block');
  
  // If on a protected page, redirect to login
  const isProtectedPage = document.querySelector('.protected-page') || 
                         window.location.pathname.includes('/dashboard/') || 
                         window.location.pathname.includes('/employer/dashboard/');
  
  if (isProtectedPage) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
}

// Auth module is already exported above
