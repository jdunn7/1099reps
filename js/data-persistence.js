/**
 * Data Persistence Module
 * Handles consistent data storage and retrieval across the application
 */
import { db, auth } from './firebase-config.js';
import { USER_TYPES } from './constants.js';

/**
 * Save form data to localStorage as user types
 * @param {string} formId - ID of the form
 */
export function enableFormPersistence(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  // Load saved form data if available
  loadFormData(formId);
  
  // Save form data as user types
  form.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      // Don't save password fields
      if (e.target.type !== 'password') {
        saveFormField(formId, e.target.name, e.target.value);
      }
    }
  });
  
  // Clear saved form data on successful submission
  form.addEventListener('submit', () => {
    clearFormData(formId);
  });
}

/**
 * Save a single form field to localStorage
 * @param {string} formId - ID of the form
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value of the field
 */
export function saveFormField(formId, fieldName, value) {
  try {
    // Get existing form data or initialize empty object
    const formData = JSON.parse(localStorage.getItem(`form_${formId}`) || '{}');
    
    // Update field value
    formData[fieldName] = value;
    
    // Save updated form data
    localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
    console.log(`Field ${fieldName} saved for form ${formId}`);
  } catch (error) {
    console.error('Error saving form field:', error);
  }
}

/**
 * Load saved form data from localStorage
 * @param {string} formId - ID of the form
 */
export function loadFormData(formId) {
  try {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Get saved form data
    const formData = JSON.parse(localStorage.getItem(`form_${formId}`) || '{}');
    
    // Populate form fields with saved data
    Object.keys(formData).forEach(fieldName => {
      const field = form.elements[fieldName];
      if (field && field.type !== 'password') {
        field.value = formData[fieldName];
      }
    });
    
    console.log(`Form data loaded for ${formId}`);
  } catch (error) {
    console.error('Error loading form data:', error);
  }
}

/**
 * Clear saved form data from localStorage
 * @param {string} formId - ID of the form
 */
export function clearFormData(formId) {
  localStorage.removeItem(`form_${formId}`);
  console.log(`Form data cleared for ${formId}`);
}

/**
 * Save user profile data to Firestore
 * @param {Object} profileData - User profile data
 * @param {string} userType - User type (rep or company)
 * @returns {Promise<void>}
 */
export async function saveUserProfile(profileData, userType = null) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Determine user type if not provided
    if (!userType) {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        userType = userDoc.data().userType;
      } else {
        throw new Error('User document not found');
      }
    }
    
    // Update timestamp
    profileData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    // Update user document
    await db.collection('users').doc(user.uid).update({
      ...profileData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update type-specific document
    if (userType === USER_TYPES.COMPANY) {
      await db.collection('companies').doc(user.uid).update(profileData);
    } else {
      await db.collection('reps').doc(user.uid).update(profileData);
    }
    
    // Update localStorage
    updateLocalUserData(profileData);
    
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Load user profile data from Firestore
 * @param {string} userId - User ID
 * @param {string} userType - User type (rep or company)
 * @returns {Promise<Object>} - User profile data
 */
export async function loadUserProfile(userId = null, userType = null) {
  try {
    // Use current user if userId not provided
    if (!userId) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.uid;
    }
    
    // Get user document to determine type if not provided
    if (!userType) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userType = userDoc.data().userType;
      } else {
        throw new Error('User document not found');
      }
    }
    
    // Get type-specific document
    let profileDoc;
    if (userType === USER_TYPES.COMPANY) {
      profileDoc = await db.collection('companies').doc(userId).get();
    } else {
      profileDoc = await db.collection('reps').doc(userId).get();
    }
    
    if (!profileDoc.exists) {
      throw new Error('Profile document not found');
    }
    
    const profileData = profileDoc.data();
    
    // Update localStorage
    updateLocalUserData(profileData);
    
    console.log('Profile loaded successfully');
    return profileData;
  } catch (error) {
    console.error('Error loading profile:', error);
    throw error;
  }
}

/**
 * Update local user data in localStorage
 * @param {Object} newData - New user data
 */
export function updateLocalUserData(newData) {
  try {
    // Get existing user data
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    // Merge with new data
    const updatedData = { ...userData, ...newData };
    
    // Save updated data
    localStorage.setItem('user_data', JSON.stringify(updatedData));
    
    console.log('Local user data updated');
  } catch (error) {
    console.error('Error updating local user data:', error);
  }
}

/**
 * Get user data from localStorage
 * @returns {Object} - User data
 */
export function getLocalUserData() {
  try {
    return JSON.parse(localStorage.getItem('user_data') || '{}');
  } catch (error) {
    console.error('Error getting local user data:', error);
    return {};
  }
}

/**
 * Sync form with Firestore data
 * @param {string} formId - ID of the form
 * @param {string} collection - Firestore collection
 * @param {string} docId - Document ID
 */
export async function syncFormWithFirestore(formId, collection, docId = null) {
  try {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Use current user ID if docId not provided
    if (!docId) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      docId = user.uid;
    }
    
    // Get document from Firestore
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) {
      console.warn('Document not found in Firestore');
      return;
    }
    
    const data = doc.data();
    
    // Populate form fields with Firestore data
    Object.keys(data).forEach(fieldName => {
      const field = form.elements[fieldName];
      if (field && field.type !== 'password' && data[fieldName] !== undefined) {
        // Handle different field types
        if (field.type === 'checkbox') {
          field.checked = Boolean(data[fieldName]);
        } else if (field.type === 'radio') {
          const radio = form.querySelector(`input[name="${fieldName}"][value="${data[fieldName]}"]`);
          if (radio) radio.checked = true;
        } else {
          field.value = data[fieldName];
        }
      }
    });
    
    console.log(`Form ${formId} synced with Firestore`);
    
    // Setup listeners for form changes
    setupFormChangeListeners(form, collection, docId);
  } catch (error) {
    console.error('Error syncing form with Firestore:', error);
  }
}

/**
 * Setup listeners for form changes to sync with Firestore
 * @param {HTMLFormElement} form - Form element
 * @param {string} collection - Firestore collection
 * @param {string} docId - Document ID
 */
function setupFormChangeListeners(form, collection, docId) {
  // Debounce function to limit Firestore updates
  let timeout;
  const debounce = (callback, delay = 1000) => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
  
  // Listen for input changes
  form.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      // Don't save password fields
      if (e.target.type !== 'password') {
        const fieldName = e.target.name;
        let value = e.target.value;
        
        // Handle different field types
        if (e.target.type === 'checkbox') {
          value = e.target.checked;
        } else if (e.target.type === 'radio') {
          if (!e.target.checked) return; // Only update when radio is checked
        }
        
        // Debounce Firestore update
        debounce(() => {
          const update = {};
          update[fieldName] = value;
          db.collection(collection).doc(docId).update(update)
            .then(() => console.log(`Field ${fieldName} updated in Firestore`))
            .catch(error => console.error('Error updating field in Firestore:', error));
        });
      }
    }
  });
}

/**
 * Save form data to Firestore
 * @param {string} formId - ID of the form
 * @param {string} collection - Firestore collection
 * @param {string} docId - Document ID (optional, uses current user ID if not provided)
 * @param {boolean} merge - Whether to merge with existing document
 * @returns {Promise<string>} - Document ID
 */
export async function saveFormToFirestore(formId, collection, docId = null, merge = true) {
  try {
    const form = document.getElementById(formId);
    if (!form) throw new Error('Form not found');
    
    // Get form data
    const formData = {};
    Array.from(form.elements).forEach(field => {
      if (field.name && field.type !== 'password' && field.type !== 'submit') {
        if (field.type === 'checkbox') {
          formData[field.name] = field.checked;
        } else if (field.type === 'radio') {
          if (field.checked) formData[field.name] = field.value;
        } else {
          formData[field.name] = field.value;
        }
      }
    });
    
    // Add timestamps
    formData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    // Use current user ID if docId not provided
    if (!docId) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      docId = user.uid;
    }
    
    // Check if document exists
    const docRef = db.collection(collection).doc(docId);
    const docSnapshot = await docRef.get();
    
    if (docSnapshot.exists) {
      // Update existing document
      if (merge) {
        await docRef.update(formData);
      } else {
        // Add createdAt if creating a new document version
        formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await docRef.set(formData);
      }
    } else {
      // Create new document
      formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await docRef.set(formData);
    }
    
    // Clear saved form data from localStorage
    clearFormData(formId);
    
    console.log(`Form ${formId} saved to Firestore`);
    return docId;
  } catch (error) {
    console.error('Error saving form to Firestore:', error);
    throw error;
  }
}

/**
 * Initialize data persistence for the application
 */
export function initDataPersistence() {
  // Listen for auth state changes
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('Data persistence initialized for user:', user.uid);
      
      // Enable form persistence for common forms
      const forms = [
        'profile-form',
        'company-profile-form',
        'job-posting-form',
        'settings-form'
      ];
      
      forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
          enableFormPersistence(formId);
        }
      });
    } else {
      // User is signed out
      console.log('User signed out, data persistence disabled');
    }
  });
}
