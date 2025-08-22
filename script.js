document.addEventListener('DOMContentLoaded', function() {
    // Waitlist form submission
    const waitlistForm = document.querySelector('.waitlist-form');
    const emailInput = document.querySelector('#email');
    const companyInput = document.querySelector('#company');
    const submitBtn = document.querySelector('.submit-btn');
    
    waitlistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const company = companyInput.value.trim();
        
        if (email && validateEmail(email)) {
            // Animate submission
            submitBtn.innerHTML = '<span>JOINING...</span>';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            
            // Send to secure API endpoint
            fetch('https://wxcja8pewg.execute-api.us-east-1.amazonaws.com/prod/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    company: company
                })
            }).then(response => {
                if (response.ok) {
                    submitBtn.innerHTML = '<span>WELCOME ABOARD</span>';
                    submitBtn.style.background = '#059669';
                    
                    // Reset form
                    emailInput.value = '';
                    companyInput.value = '';
                } else {
                    submitBtn.innerHTML = '<span>ERROR - TRY AGAIN</span>';
                    submitBtn.style.background = '#dc2626';
                }
                
                setTimeout(() => {
                    submitBtn.innerHTML = '<span>JOIN WAITLIST</span><span class="btn-arrow">→</span>';
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '';
                    submitBtn.disabled = false;
                }, 3000);
            }).catch(error => {
                console.error('Error:', error);
                submitBtn.innerHTML = '<span>ERROR - TRY AGAIN</span>';
                submitBtn.style.background = '#dc2626';
                
                setTimeout(() => {
                    submitBtn.innerHTML = '<span>JOIN WAITLIST</span><span class="btn-arrow">→</span>';
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '';
                    submitBtn.disabled = false;
                }, 3000);
            });
        }
    });
    
    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Grid item hover effects
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 30px rgba(255, 0, 0, 0.1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
    
    // Smooth scroll for navigation
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
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.grid-item, .feature, .access-form');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add animation class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Subtle parallax effect on scroll
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const visualGrid = document.querySelector('.visual-grid');
        
        if (visualGrid) {
            visualGrid.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
    
});