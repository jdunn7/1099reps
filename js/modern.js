/**
 * 1099 REPS - Modern JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled', 'shadow-sm');
            } else {
                navbar.classList.remove('scrolled', 'shadow-sm');
            }
        });
    }

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Animate elements on scroll
    const animateElements = document.querySelectorAll('[data-animate]');
    
    if (animateElements.length > 0) {
        const animateOnScroll = function() {
            animateElements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementPosition < windowHeight - 50) {
                    const animationClass = element.dataset.animate || 'fade-in';
                    element.classList.add(animationClass);
                    element.style.opacity = 1;
                }
            });
        };
        
        // Set initial state
        animateElements.forEach(element => {
            element.style.opacity = 0;
        });
        
        // Run once on load
        animateOnScroll();
        
        // Run on scroll
        window.addEventListener('scroll', animateOnScroll);
    }

    // Job search form submission
    const jobSearchForm = document.getElementById('job-search-form');
    if (jobSearchForm) {
        jobSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const keyword = document.getElementById('keyword')?.value || '';
            const location = document.getElementById('location')?.value || '';
            const category = document.getElementById('category')?.value || '';
            
            // Here you would typically send this to your backend or API
            console.log('Job Search:', { keyword, location, category });
            
            // For demo purposes, show a message
            const searchResultsCount = document.querySelector('.job-list h2');
            if (searchResultsCount) {
                searchResultsCount.textContent = '25 Jobs Found';
                
                // Add a subtle animation to the job list
                const jobList = document.querySelector('.job-list');
                if (jobList) {
                    jobList.style.opacity = 0;
                    setTimeout(() => {
                        jobList.style.opacity = 1;
                        jobList.style.transition = 'opacity 0.5s ease';
                    }, 300);
                }
            }
        });
    }

    // Newsletter form submission - ONLY for actual newsletter forms, not login/signup
    const newsletterForms = document.querySelectorAll('form.newsletter-form');
    
    // If no specific newsletter forms found, look for footer newsletter forms
    if (newsletterForms.length === 0) {
        const footerForms = document.querySelectorAll('footer form');
        
        if (footerForms.length > 0) {
            footerForms.forEach(form => {
                if (form.querySelector('input[type="email"]') && 
                    !form.id.includes('login') && 
                    !form.id.includes('signup')) {
                    
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const emailInput = this.querySelector('input[type="email"]');
                        
                        if (emailInput && emailInput.value) {
                            // Here you would typically send this to your backend
                            console.log('Newsletter subscription:', emailInput.value);
                            alert('Thank you for subscribing to our newsletter!');
                            emailInput.value = '';
                        }
                    });
                }
            });
        }
    } else {
        // If specific newsletter forms found, use those
        newsletterForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                
                if (emailInput && emailInput.value) {
                    console.log('Newsletter subscription:', emailInput.value);
                    alert('Thank you for subscribing to our newsletter!');
                    emailInput.value = '';
                }
            });
        });
    }

    // Job filter functionality
    const filterButton = document.querySelector('.card-body .btn-primary');
    if (filterButton) {
        filterButton.addEventListener('click', function() {
            // In a real implementation, this would apply filters and update results
            const jobList = document.querySelector('.job-list');
            if (jobList) {
                jobList.style.opacity = 0;
                setTimeout(() => {
                    jobList.style.opacity = 1;
                    jobList.style.transition = 'opacity 0.5s ease';
                }, 300);
            }
        });
    }

    // Mobile menu improvements
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            document.body.classList.toggle('navbar-open');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (
                document.body.classList.contains('navbar-open') && 
                !navbarCollapse.contains(e.target) && 
                !navbarToggler.contains(e.target)
            ) {
                navbarToggler.click();
            }
        });
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
