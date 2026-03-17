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
    
    // Define references for our handlers so they can be securely called in one scroll listener
    let handleVideoScrollStr = null;
    let handleServicesVideoScrollStr = null;

    // Video Scroll Animation Logic
    const scrollVideo = document.getElementById('scroll-video');
    const videoContainer = document.querySelector('.hero-video-container');

    if (scrollVideo && videoContainer) {
        scrollVideo.pause();

        handleVideoScrollStr = () => {
            if (isNaN(scrollVideo.duration)) return;

            const scrollTop = window.scrollY;
            const heroHeight = document.querySelector('.hero').offsetHeight;
            const triggerDistance = heroHeight * 0.8;
            
            let scrollProgress = scrollTop / triggerDistance;
            if (scrollProgress > 1) scrollProgress = 1;
            if (scrollProgress < 0) scrollProgress = 0;

            const targetTime = scrollProgress * scrollVideo.duration;

            try {
                if (Math.abs(scrollVideo.currentTime - targetTime) > 0.05) {
                   scrollVideo.currentTime = targetTime;
                }
            } catch (e) {
                // Ignore InvalidStateError if video is not fully ready
            }

            const opacity = 0.15 + (scrollProgress * 0.85);
            videoContainer.style.opacity = opacity.toString();
        };

        scrollVideo.addEventListener('loadedmetadata', () => {
            if (handleVideoScrollStr) handleVideoScrollStr();
        });
        
        if (handleVideoScrollStr) handleVideoScrollStr();
    }

    // Services Video Scroll Animation Logic
    const servicesVideo = document.getElementById('services-scroll-video');
    const servicesVideoContainer = document.querySelector('.services-video-container');

    if (servicesVideo && servicesVideoContainer) {
        servicesVideo.pause();

        handleServicesVideoScrollStr = () => {
            if (isNaN(servicesVideo.duration)) return;

            const servicesSection = document.getElementById('services');
            if(!servicesSection) return;

            const rect = servicesSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            let scrollProgress = 0;
            
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                const totalDistance = windowHeight + rect.height;
                const distanceScrolled = windowHeight - rect.top;
                
                scrollProgress = distanceScrolled / totalDistance;
                scrollProgress = scrollProgress * 1.5; 
                
                if (scrollProgress > 1) scrollProgress = 1;
                if (scrollProgress < 0) scrollProgress = 0;
            } else if (rect.top > windowHeight) {
                scrollProgress = 0;
            } else {
                scrollProgress = 1;
            }

            const targetTime = scrollProgress * servicesVideo.duration;

            try {
                if (Math.abs(servicesVideo.currentTime - targetTime) > 0.05) {
                    servicesVideo.currentTime = targetTime;
                }
            } catch (e) {
                // Ignore InvalidStateError if video is not fully ready
            }

            const opacity = 0.10 + (scrollProgress * 0.7);
            servicesVideoContainer.style.opacity = opacity.toString();
        };

        servicesVideo.addEventListener('loadedmetadata', () => {
            if (handleServicesVideoScrollStr) handleServicesVideoScrollStr();
        });

        if (handleServicesVideoScrollStr) handleServicesVideoScrollStr();
    }

    // Attach to scroll with requestAnimationFrame for performance
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                if (handleVideoScrollStr) handleVideoScrollStr();
                if (handleServicesVideoScrollStr) handleServicesVideoScrollStr();
                isTicking = false;
            });
            isTicking = true;
        }
    });

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
