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

    // Form Submission with Web3Forms & GA4 Lead Tracking
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = leadForm.querySelector('button[type="submit"]');
            const btnText = btn ? btn.querySelector('.btn-text') : null;
            const originalText = btnText ? btnText.textContent : (btn ? btn.textContent : 'Request Quote');
            const fallbackEl = document.getElementById('form-fallback');
            const successEl = document.getElementById('form-success');

            if (fallbackEl) fallbackEl.hidden = true;
            if (successEl) successEl.hidden = true;

            const setLabel = (text) => {
                if (btnText) btnText.textContent = text;
                else if (btn) btn.textContent = text;
            };

            setLabel('Sending…');
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.8';
            }

            try {
                // Check honeypot
                if (leadForm.botcheck && leadForm.botcheck.checked) {
                    console.warn('Bot submission blocked');
                    return;
                }

                const accessKey = 'TODO(nick): WEB3FORMS_ACCESS_KEY';

                // If access key hasn't been configured by Nick yet, surface graceful fallback
                if (accessKey.startsWith('TODO')) {
                    throw new Error('Web3Forms access key not yet configured.');
                }

                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        access_key: accessKey,
                        subject: 'New Quote Request — baraelec.com.au',
                        from_name: 'Bara Electrical Website',
                        name: leadForm.name ? leadForm.name.value : '',
                        phone: leadForm.phone ? leadForm.phone.value : '',
                        service: leadForm.service ? leadForm.service.value : '',
                        message: leadForm.message ? leadForm.message.value : '',
                        botcheck: leadForm.botcheck ? leadForm.botcheck.value : ''
                    })
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Submission failed');

                setLabel('Request Sent ✓');
                leadForm.reset();
                if (successEl) successEl.hidden = false;

                // Fire GA4 conversion event
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'generate_lead', {
                        event_category: 'contact',
                        event_label: 'quote_form',
                        method: 'quote_form'
                    });
                }
            } catch (err) {
                console.error('Quote submission error:', err);
                setLabel('Could not send — call us');
                if (fallbackEl) fallbackEl.hidden = false;
            } finally {
                setTimeout(() => {
                    setLabel(originalText);
                    if (btn) {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }
                }, 4500);
            }
        });
    }

    // GA4 Tracking for Call and Email Clicks
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
