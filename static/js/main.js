// Main JavaScript file for Lumora

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Add smooth scrolling for anchor links
    addSmoothScrolling();
    
    // Add loading animations
    addLoadingAnimations();
    
    // Initialize star rating functionality
    initStarRatings();
    
    // Add hover effects for cards
    addCardHoverEffects();
    
    // Initialize mobile menu (if needed)
    initMobileMenu();
}

function addSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function addLoadingAnimations() {
    // Add fade-in animation for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step, .movie-rating-card, .recommendation-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initStarRatings() {
    // Enhanced star rating functionality
    const starContainers = document.querySelectorAll('.star-rating');
    
    starContainers.forEach(container => {
        const stars = container.querySelectorAll('.star-label');
        const inputs = container.querySelectorAll('.star-input');
        const ratingText = container.parentElement.querySelector('.rating-value');
        
        stars.forEach((star, index) => {
            // Hover effects
            star.addEventListener('mouseenter', () => {
                highlightStars(stars, index);
            });
            
            star.addEventListener('mouseleave', () => {
                const checkedInput = container.querySelector('.star-input:checked');
                if (checkedInput) {
                    const checkedIndex = Array.from(inputs).indexOf(checkedInput);
                    highlightStars(stars, checkedIndex);
                } else {
                    resetStars(stars);
                }
            });
            
            // Click functionality
            star.addEventListener('click', () => {
                const input = container.querySelector(`input[value="${index + 1}"]`);
                if (input) {
                    input.checked = true;
                    updateRatingText(ratingText, index + 1);
                    highlightStars(stars, index);
                }
            });
        });
        
        // Handle "Not rated" option
        const notRatedInput = container.querySelector('input[value="0"]');
        if (notRatedInput) {
            notRatedInput.addEventListener('change', () => {
                resetStars(stars);
                updateRatingText(ratingText, 0);
            });
        }
    });
}

function highlightStars(stars, index) {
    stars.forEach((star, i) => {
        const icon = star.querySelector('i');
        if (i <= index) {
            icon.className = 'fas fa-star';
            icon.style.color = '#ffd700';
        } else {
            icon.className = 'far fa-star';
            icon.style.color = '#ddd';
        }
    });
}

function resetStars(stars) {
    stars.forEach(star => {
        const icon = star.querySelector('i');
        icon.className = 'far fa-star';
        icon.style.color = '#ddd';
    });
}

function updateRatingText(ratingText, rating) {
    if (rating === 0) {
        ratingText.textContent = 'Not rated';
        ratingText.className = 'rating-value not-rated';
    } else {
        ratingText.textContent = `${rating}/5 stars`;
        ratingText.className = 'rating-value rated';
    }
}

function addCardHoverEffects() {
    // Add enhanced hover effects for cards
    const cards = document.querySelectorAll('.movie-rating-card, .recommendation-card, .feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function initMobileMenu() {
    // Mobile menu functionality (if needed)
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Form validation
function validateRatingForm() {
    const form = document.querySelector('.rating-form');
    if (!form) return true;
    
    const ratings = form.querySelectorAll('input[type="radio"]:checked');
    const ratedMovies = Array.from(ratings).filter(input => input.value !== '0');
    
    if (ratedMovies.length === 0) {
        showNotification('Please rate at least one movie to get recommendations!', 'error');
        return false;
    }
    
    return true;
}

// Add form validation to submit button
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.querySelector('.rating-form .btn-primary');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            if (!validateRatingForm()) {
                e.preventDefault();
            }
        });
    }
});

// Search functionality (if needed)
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const movies = document.querySelectorAll('.movie-rating-card, .recommendation-card');
            
            movies.forEach(movie => {
                const title = movie.querySelector('.movie-title').textContent.toLowerCase();
                const genre = movie.querySelector('.movie-genre').textContent.toLowerCase();
                
                if (title.includes(query) || genre.includes(query)) {
                    movie.style.display = 'block';
                } else {
                    movie.style.display = 'none';
                }
            });
        });
    }
}

// Initialize search if search input exists
document.addEventListener('DOMContentLoaded', initSearch);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.querySelector('.rating-form');
        if (form) {
            form.submit();
        }
    }
    
    // Escape to close modals or notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
});

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add scroll-based animations
const scrollAnimations = debounce(() => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
}, 10);

window.addEventListener('scroll', scrollAnimations);

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', scrollAnimations); 