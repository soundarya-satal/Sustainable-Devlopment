// Navigation function
function navigateToPage(pageName) {
    // Just navigate directly to the page specified in data-page attribute
    if (pageName) {
        window.location.href = pageName;
    } else {
        console.error('Page not found:', pageName);
    }
}

// Add click event listeners to management cards
document.addEventListener('DOMContentLoaded', function() {
    const managementCards = document.querySelectorAll('.management-card');
    
    managementCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add loading state
            card.classList.add('loading');
            card.style.transform = 'scale(0.98)';
            
            // Get the page name from data attribute
            const pageName = card.dataset.page;
            
            // Navigate after a short delay for visual feedback
            setTimeout(() => {
                navigateToPage(pageName);
            }, 200);
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('loading')) {
                this.style.transform = '';
            }
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(anchor => {
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
    
    // Initialize entrance animations
    initializeAnimations();
    
    // Add keyboard navigation
    addKeyboardNavigation();
});

// Initialize entrance animations
function initializeAnimations() {
    const cards = document.querySelectorAll('.management-card');
    const hero = document.querySelector('.hero-section');
    
    // Animate hero section
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        hero.style.transition = 'all 0.8s ease';
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
    }, 100);
    
    // Animate cards with staggered delay
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
}

// Add keyboard navigation support
function addKeyboardNavigation() {
    const cards = document.querySelectorAll('.management-card');
    
    cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
            
            // Arrow key navigation
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextCard = cards[index + 1] || cards[0];
                nextCard.focus();
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevCard = cards[index - 1] || cards[cards.length - 1];
                prevCard.focus();
            }
        });
    });
}

// Search functionality (optional enhancement)
function searchManagement(query) {
    const cards = document.querySelectorAll('.management-card');
    const searchTerm = query.toLowerCase().trim();
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-description').textContent.toLowerCase();
        
        if (searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    if (hero) {
        const rate = scrolled * -0.2;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Intersection Observer for animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    const cards = document.querySelectorAll('.management-card');
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Handle window resize
window.addEventListener('resize', function() {
    // Reset any transforms on mobile
    if (window.innerWidth <= 768) {
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.style.transform = '';
        }
    }
});

// Prevent card animation conflicts
function resetCardStates() {
    const cards = document.querySelectorAll('.management-card');
    cards.forEach(card => {
        card.classList.remove('loading');
        card.style.transform = '';
    });
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        resetCardStates();
    }
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    const cards = document.querySelectorAll('.management-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                if (!this.classList.contains('loading')) {
                    this.style.transform = '';
                }
            }, 100);
        });
    });
}

// Console welcome message
console.log(`
🏘️ Welcome to Village 360 Management System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard initialized successfully!
Available management systems:
• Electricity Management
• Sanitation Management  
• Waste Management
• Road Connectivity
• Economic Status
• Social Management
• Education Management
• Water Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Export functions for potential external use
window.VillageManagement = {
    navigateToPage,
    searchManagement,
    resetCardStates
};