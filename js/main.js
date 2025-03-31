/**
 * 1099 REPS - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
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
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateElements.length > 0) {
        const animateOnScroll = function() {
            animateElements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementPosition < windowHeight - 50) {
                    const animationClass = element.dataset.animation || 'fade-in';
                    element.classList.add(animationClass);
                }
            });
        };
        
        // Run once on load
        animateOnScroll();
        
        // Run on scroll
        window.addEventListener('scroll', animateOnScroll);
    }

    // Newsletter form submission
    const newsletterForm = document.querySelector('form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (emailInput && emailInput.value) {
                // Here you would typically send this to your backend
                // For now, we'll just show an alert
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }

    // Job search form functionality (for job search page)
    const jobSearchForm = document.getElementById('job-search-form');
    if (jobSearchForm) {
        jobSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const keyword = document.getElementById('keyword').value;
            const location = document.getElementById('location').value;
            const category = document.getElementById('category').value;
            
            // Here you would typically send this to your backend or API
            // For demo purposes, we'll just log the search parameters
            console.log('Job Search:', { keyword, location, category });
            
            // You could redirect to a results page with query parameters
            // window.location.href = `results.html?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`;
        });
    }

    // Parse URL parameters (useful for job search results page)
    function getUrlParams() {
        const params = {};
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        
        return params;
    }

    // Fill form fields from URL parameters (for job search page)
    const urlParams = getUrlParams();
    if (Object.keys(urlParams).length > 0) {
        // If we have URL parameters and we're on a page with a form
        for (const [key, value] of Object.entries(urlParams)) {
            const field = document.getElementById(key);
            if (field) {
                field.value = value;
            }
        }
        
        // If we're on the category page, we might want to highlight the category
        if (urlParams.category) {
            const categoryElement = document.querySelector(`[data-category="${urlParams.category}"]`);
            if (categoryElement) {
                categoryElement.classList.add('active');
            }
        }
    }
});
