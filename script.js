// Bara Electrical Servicing - Interactive Application Logic
(function () {
    function initBaraApp() {
        // 1. Safe Footer Year
        try {
            const yearEl = document.getElementById('year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        } catch (e) {
            console.warn('Year update skipped:', e);
        }

        // 2. Navbar Scroll Glass Effect
        try {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 30) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }, { passive: true });
            }
        } catch (e) {
            console.warn('Navbar scroll listener error:', e);
        }

        // 3. Bulletproof Mobile Menu Toggle
        try {
            const mobileToggle = document.querySelector('.mobile-menu-toggle, .mobile-menu-btn');
            const navLinks = document.querySelector('.nav-links');

            if (mobileToggle && navLinks) {
                const toggleMenu = (e) => {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    const isOpen = navLinks.classList.toggle('active');
                    mobileToggle.classList.toggle('active', isOpen);
                    mobileToggle.setAttribute('aria-expanded', String(isOpen));
                };

                mobileToggle.addEventListener('click', toggleMenu);

                // Auto-close menu when clicking any nav link
                navLinks.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        navLinks.classList.remove('active');
                        mobileToggle.classList.remove('active');
                        mobileToggle.setAttribute('aria-expanded', 'false');
                    });
                });

                // Auto-close menu when tapping/clicking outside
                document.addEventListener('click', (e) => {
                    if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                        navLinks.classList.remove('active');
                        mobileToggle.classList.remove('active');
                        mobileToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        } catch (e) {
            console.error('Mobile menu init error:', e);
        }

        // 4. Smooth Scrolling for anchored links
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (!targetId || targetId === '#' || targetId.length < 2) return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = 85;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        } catch (e) {
            console.warn('Smooth scroll init error:', e);
        }

        // 5. Quote Form Submission Handling (with honeypot & feedback)
        try {
            const forms = document.querySelectorAll('form.quote-form, #lead-form, #quote-form');
            forms.forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const submitBtn = form.querySelector('button[type="submit"]');
                    const statusEl = form.querySelector('.form-status') || document.getElementById('form-status') || document.getElementById('form-success');
                    const fallbackEl = form.querySelector('.form-fallback') || document.getElementById('form-fallback');
                    
                    // Honeypot bot prevention
                    const botcheck = form.querySelector('input[name="botcheck"]');
                    if (botcheck && botcheck.checked) {
                        console.warn('Bot submission blocked');
                        return;
                    }

                    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send Enquiry';
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span>Sending…</span>';
                    }

                    try {
                        const formData = new FormData(form);
                        const object = Object.fromEntries(formData);
                        const json = JSON.stringify(object);

                        const res = await fetch('https://api.web3forms.com/submit', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: json
                        });

                        const result = await res.json();
                        if (result.success) {
                            if (statusEl) {
                                statusEl.style.display = 'block';
                                statusEl.textContent = '✅ Thank you! Your request has been received. Nick will contact you shortly.';
                                statusEl.classList.add('success');
                            }
                            form.reset();
                            if (submitBtn) submitBtn.innerHTML = '<span>Enquiry Sent ✓</span>';
                            
                            if (typeof window.gtag === 'function') {
                                window.gtag('event', 'generate_lead', {
                                    event_category: 'quote',
                                    event_label: 'quote_submission'
                                });
                            }
                        } else {
                            throw new Error(result.message || 'Submission failed');
                        }
                    } catch (err) {
                        console.error('Submission error:', err);
                        if (fallbackEl) {
                            fallbackEl.style.display = 'block';
                        }
                        if (submitBtn) submitBtn.innerHTML = '<span>Please Call Directly</span>';
                    } finally {
                        setTimeout(() => {
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = originalBtnHtml;
                            }
                        }, 4000);
                    }
                });
            });
        } catch (e) {
            console.warn('Form handler error:', e);
        }

        // 6. GA4 Call & Email Click Tracking
        try {
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                link.addEventListener('click', () => {
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'click_to_call', {
                            event_category: 'contact',
                            event_label: link.getAttribute('href')
                        });
                    }
                });
            });

            document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
                link.addEventListener('click', () => {
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'click_to_email', {
                            event_category: 'contact',
                            event_label: link.getAttribute('href')
                        });
                    }
                });
            });
        } catch (e) {
            console.warn('GA4 click listener error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBaraApp);
    } else {
        initBaraApp();
    }
})();
