/**
 * 1099REPS Dashboard Handler
 * Handles dashboard functionality and data display
 */

// Import necessary functions
import { isAuthenticated, getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase auth state to be determined before checking authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, initialize dashboard
            console.log('User is authenticated, initializing dashboard');
            initializeDashboard();
        } else {
            // No user is signed in, redirect to login
            console.log('User is not authenticated, redirecting to login');
            window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
    });
});

/**
 * Initialize dashboard with user data
 */
async function initializeDashboard() {
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
        updateDashboardUI(userData);
        
        // Load dashboard statistics
        loadDashboardStats(userData);
        
        // Load recent activity
        loadRecentActivity(userData);
        
        // Load recommended jobs
        loadRecommendedJobs(userData);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorAlert('Error loading dashboard data. Please refresh the page.');
    }
}

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
async function getUserData(userId) {
    try {
        console.log('Getting user data for ID:', userId);
        // Get user document from Firestore
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            console.warn('User document not found in Firestore');
            // Instead of throwing an error, return basic user data from auth
            const user = firebase.auth().currentUser;
            return {
                userId: user.uid,
                email: user.email,
                userType: 'rep', // Default to rep if not known
                profile: {}
            };
        }
        
        const userData = userDoc.data();
        console.log('User data retrieved:', userData.userType);
        
        // Get additional data based on user type
        const collection = userData.userType === 'rep' ? 'reps' : 'companies';
        let profileData = {};
        
        try {
            const profileDoc = await firebase.firestore().collection(collection).doc(userId).get();
            if (profileDoc.exists) {
                profileData = profileDoc.data();
                console.log('Profile data retrieved successfully');
            } else {
                console.warn('Profile document not found, using empty profile');
            }
        } catch (profileError) {
            console.warn('Error fetching profile, using empty profile:', profileError);
        }
        
        // Combine user and profile data
        return {
            ...userData,
            profile: profileData
        };
    } catch (error) {
        console.error('Error getting user data:', error);
        throw error;
    }
}

/**
 * Update dashboard UI with user data
 * @param {Object} userData - User data
 */
function updateDashboardUI(userData) {
    console.log('Updating dashboard UI with user data');
    
    // Ensure profile exists to prevent errors
    userData.profile = userData.profile || {};
    
    // Update user name in welcome message
    const welcomeMessage = document.querySelector('.dashboard-main h1');
    if (welcomeMessage) {
        let displayName = 'there';
        
        if (userData.userType === 'rep' && userData.profile) {
            displayName = userData.profile.firstName || userData.email?.split('@')[0] || displayName;
        } else if (userData.userType === 'company' && userData.profile) {
            displayName = userData.profile.contactName || userData.profile.companyName || userData.email?.split('@')[0] || displayName;
        }
        
        welcomeMessage.textContent = `Welcome back, ${displayName}!`;
        console.log('Welcome message updated for:', displayName);
    }
    
    // Update user avatar and name in navbar
    const userAvatar = document.querySelector('#userDropdown img');
    const userName = document.querySelector('#userDropdown span');
    
    if (userAvatar && userName) {
        // Set user name with fallbacks
        if (userData.userType === 'rep') {
            const firstName = userData.profile.firstName || '';
            const lastName = userData.profile.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            userName.textContent = fullName || userData.email || 'User';
        } else if (userData.userType === 'company') {
            userName.textContent = userData.profile.companyName || userData.email || 'Company';
        } else {
            userName.textContent = userData.email || 'User';
        }
        
        // Set user avatar if available
        if (userData.profile.avatarUrl) {
            userAvatar.src = userData.profile.avatarUrl;
        }
        
        console.log('User name in navbar updated');
    }
    
    // Update logout link - using a more reliable selector
    const logoutLinks = document.querySelectorAll('a');
    logoutLinks.forEach(link => {
        if (link.textContent.includes('Logout') || link.textContent.includes('Sign Out')) {
            console.log('Found logout link:', link.textContent);
            link.href = '#';
            link.addEventListener('click', handleLogout);
        }
    });
    
    // Also add event listener to any element with logout class
    const logoutButtons = document.querySelectorAll('.logout, .sign-out');
    logoutButtons.forEach(button => {
        console.log('Found logout button');
        button.addEventListener('click', handleLogout);
    });
}

/**
 * Handle logout action
 * @param {Event} event - Click event
 */
async function handleLogout(event) {
    event.preventDefault();
    console.log('Logout initiated');
    
    try {
        // Sign out user
        await firebase.auth().signOut();
        console.log('User signed out successfully');
        
        // Redirect to home page
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

/**
 * Load dashboard statistics
 * @param {Object} userData - User data
 */
async function loadDashboardStats(userData) {
    try {
        console.log('Loading dashboard stats for user type:', userData.userType);
        // Get stats based on user type
        let stats = {
            applications: 0,
            interviews: 0,
            offers: 0,
            connections: 0
        };
        
        try {
            if (userData.userType === 'rep') {
                const repStats = await getRepStats(userData.userId);
                if (repStats) {
                    stats = { ...stats, ...repStats };
                }
            } else if (userData.userType === 'company') {
                const companyStats = await getCompanyStats(userData.userId);
                if (companyStats) {
                    stats = { ...stats, ...companyStats };
                }
            }
        } catch (statsError) {
            console.warn('Error fetching specific stats, using defaults:', statsError);
        }
        
        // Update stats in UI
        updateStatsUI(stats);
        console.log('Dashboard stats updated successfully');
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Don't let stats errors crash the dashboard
    }
}

/**
 * Get statistics for rep users
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Rep statistics
 */
async function getRepStats(userId) {
    // In a real implementation, this would fetch data from Firestore
    // For now, return mock data
    return {
        applications: {
            total: 12,
            recent: '2 in last 7 days'
        },
        interviews: {
            total: 4,
            recent: '1 scheduled this week'
        },
        savedJobs: {
            total: 8,
            recent: '3 new matches'
        },
        profileViews: {
            total: 27,
            recent: '↑ 15% this month'
        }
    };
}

/**
 * Get statistics for company users
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Company statistics
 */
async function getCompanyStats(userId) {
    // In a real implementation, this would fetch data from Firestore
    // For now, return mock data
    return {
        activeJobs: {
            total: 5,
            recent: '2 posted this month'
        },
        applications: {
            total: 34,
            recent: '12 new this week'
        },
        interviews: {
            total: 8,
            recent: '3 scheduled'
        },
        profileViews: {
            total: 156,
            recent: '↑ 23% this month'
        }
    };
}

/**
 * Update statistics UI
 * @param {Object} stats - User statistics
 */
function updateStatsUI(stats) {
    // Update applications stat
    updateStatCard('Applications', stats.applications);
    
    // Update interviews stat
    updateStatCard('Interviews', stats.interviews);
    
    // Update saved jobs or active jobs stat
    if (stats.savedJobs) {
        updateStatCard('Saved Jobs', stats.savedJobs);
    } else if (stats.activeJobs) {
        updateStatCard('Active Jobs', stats.activeJobs);
    }
    
    // Update profile views stat
    updateStatCard('Profile Views', stats.profileViews);
}

/**
 * Update a single stat card
 * @param {string} title - Stat title
 * @param {Object} data - Stat data
 */
function updateStatCard(title, data) {
    const statCard = document.querySelector(`.card:has(.h5:contains("${title}"))`);
    
    if (statCard) {
        const totalElement = statCard.querySelector('.display-6');
        const recentElement = statCard.querySelector('.text-muted');
        
        if (totalElement && data.total !== undefined) {
            totalElement.textContent = data.total;
        }
        
        if (recentElement && data.recent) {
            recentElement.textContent = data.recent;
        }
    }
}

/**
 * Load recent activity
 * @param {Object} userData - User data
 */
async function loadRecentActivity(userData) {
    try {
        // Get recent activity based on user type
        let activity;
        
        if (userData.userType === 'rep') {
            activity = await getRepActivity(userData.userId);
        } else if (userData.userType === 'company') {
            activity = await getCompanyActivity(userData.userId);
        }
        
        // Update activity in UI
        updateActivityUI(activity);
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

/**
 * Get recent activity for rep users
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Recent activity
 */
async function getRepActivity(userId) {
    // In a real implementation, this would fetch data from Firestore
    // For now, return mock data
    return [
        {
            type: 'application',
            title: 'Applied to Medical Device Sales Rep at MedTech Solutions',
            date: '2 days ago',
            icon: 'bi-briefcase',
            iconClass: 'text-primary'
        },
        {
            type: 'interview',
            title: 'Interview scheduled with Johnson Medical',
            date: 'Tomorrow at 2:00 PM',
            icon: 'bi-calendar-check',
            iconClass: 'text-success'
        },
        {
            type: 'profile',
            title: 'Your profile was viewed by 3 companies',
            date: 'This week',
            icon: 'bi-eye',
            iconClass: 'text-info'
        }
    ];
}

/**
 * Get recent activity for company users
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Recent activity
 */
async function getCompanyActivity(userId) {
    // In a real implementation, this would fetch data from Firestore
    // For now, return mock data
    return [
        {
            type: 'job',
            title: 'Posted new job: Regional Sales Manager - Northeast',
            date: '3 days ago',
            icon: 'bi-briefcase',
            iconClass: 'text-primary'
        },
        {
            type: 'application',
            title: 'Received 5 new applications',
            date: 'This week',
            icon: 'bi-person-check',
            iconClass: 'text-success'
        },
        {
            type: 'interview',
            title: 'Interview scheduled with John Smith',
            date: 'Tomorrow at 10:00 AM',
            icon: 'bi-calendar-check',
            iconClass: 'text-warning'
        }
    ];
}

/**
 * Update activity UI
 * @param {Array} activity - Recent activity
 */
function updateActivityUI(activity) {
    const activityContainer = document.querySelector('.recent-activity-list');
    
    if (activityContainer && activity && activity.length > 0) {
        // Clear existing activity items
        activityContainer.innerHTML = '';
        
        // Add new activity items
        activity.forEach(item => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item d-flex align-items-start mb-3 pb-3 border-bottom';
            
            activityItem.innerHTML = `
                <div class="activity-icon me-3">
                    <div class="rounded-circle bg-light p-2">
                        <i class="bi ${item.icon} ${item.iconClass}"></i>
                    </div>
                </div>
                <div class="activity-content">
                    <h3 class="h6 mb-1">${item.title}</h3>
                    <p class="text-muted small mb-0">${item.date}</p>
                </div>
            `;
            
            activityContainer.appendChild(activityItem);
        });
    }
}

/**
 * Load recommended jobs
 * @param {Object} userData - User data
 */
async function loadRecommendedJobs(userData) {
    // Only load recommended jobs for rep users
    if (userData.userType !== 'rep') {
        return;
    }
    
    try {
        // Get recommended jobs
        const jobs = await getRecommendedJobs(userData);
        
        // Update jobs in UI
        updateRecommendedJobsUI(jobs);
    } catch (error) {
        console.error('Error loading recommended jobs:', error);
    }
}

/**
 * Get recommended jobs for user
 * @param {Object} userData - User data
 * @returns {Promise<Array>} - Recommended jobs
 */
async function getRecommendedJobs(userData) {
    // In a real implementation, this would fetch data from Firestore
    // For now, return mock data
    return [
        {
            id: 'job1',
            title: 'Medical Device Sales Representative',
            company: 'MedTech Solutions',
            location: 'Boston, MA',
            salary: '$80,000 - $120,000',
            match: '95%',
            logo: '../images/company-logos/logo1.png'
        },
        {
            id: 'job2',
            title: 'Pharmaceutical Sales Specialist',
            company: 'PharmaCorp',
            location: 'New York, NY',
            salary: '$85,000 - $110,000',
            match: '88%',
            logo: '../images/company-logos/logo2.png'
        },
        {
            id: 'job3',
            title: 'Regional Sales Manager - Medical Devices',
            company: 'Johnson Medical',
            location: 'Chicago, IL',
            salary: '$100,000 - $140,000',
            match: '82%',
            logo: '../images/company-logos/logo3.png'
        }
    ];
}

/**
 * Update recommended jobs UI
 * @param {Array} jobs - Recommended jobs
 */
function updateRecommendedJobsUI(jobs) {
    const jobsContainer = document.querySelector('.recommended-jobs-list');
    
    if (jobsContainer && jobs && jobs.length > 0) {
        // Clear existing job items
        jobsContainer.innerHTML = '';
        
        // Add new job items
        jobs.forEach(job => {
            const jobItem = document.createElement('div');
            jobItem.className = 'col-md-4';
            
            jobItem.innerHTML = `
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="${job.logo || '../images/company-placeholder.png'}" alt="${job.company}" class="me-3" width="48" height="48">
                            <div>
                                <h3 class="h5 mb-1">${job.title}</h3>
                                <p class="text-muted mb-0">${job.company}</p>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-geo-alt text-muted me-2"></i>
                                <span>${job.location}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="bi bi-cash text-muted me-2"></i>
                                <span>${job.salary}</span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-between">
                            <span class="badge bg-success">${job.match} Match</span>
                            <a href="../job-details/${job.id}.html" class="btn btn-sm btn-outline-primary">View Job</a>
                        </div>
                    </div>
                </div>
            `;
            
            jobsContainer.appendChild(jobItem);
        });
    }
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
 * Show error alert
 * @param {string} message - Error message to display
 */
function showErrorAlert(message) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show';
    alertElement.role = 'alert';
    
    // Add alert content
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert alert at the top of the main content
    const mainContent = document.querySelector('.dashboard-main .container');
    mainContent.insertBefore(alertElement, mainContent.firstChild);
    
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
    }, 5000);
}
