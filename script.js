document.addEventListener('DOMContentLoaded', () => {
    // Current Year for Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Simple animation for hamburger
        const spans = mobileToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Smooth Scrolling for anchored links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Submission (Prevent default & show a simple alert for demo)
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = leadForm.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText ? btnText.textContent : btn.textContent;
            
            // Simulate sending
            if (btnText) btnText.textContent = 'Sending...';
            else btn.textContent = 'Sending...';
            
            btn.style.opacity = '0.8';
            btn.disabled = true;

            setTimeout(() => {
                if (btnText) {
                    btnText.textContent = 'Quote Requested!';
                    btnText.style.backgroundColor = '#10b981'; // Success green
                } else {
                    btn.textContent = 'Quote Requested! ⚡';
                    btn.style.backgroundColor = '#10b981'; // Success green
                    btn.style.color = '#ffffff';
                }
                
                // Reset form
                leadForm.reset();
                
                // Revert button after 3 seconds
                setTimeout(() => {
                    if (btnText) {
                        btnText.textContent = originalText;
                        btnText.style.backgroundColor = '';
                    } else {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }
                    btn.style.opacity = '1';
                    btn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }

    // Scroll Animation (IntersectionObserver API for fading in elements on scroll)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeUpElements = document.querySelectorAll('.bento-card, .testimonial-card, .info-item');
    // Set initial state
    fadeUpElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeUpElements.forEach(el => observer.observe(el));
    


    // Bento Magic UI Hover Effect
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
